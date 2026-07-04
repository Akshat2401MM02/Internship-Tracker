const { GoogleGenAI, Type } = require('@google/genai');
const pdfParse = require('pdf-parse');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Extract plain text from an uploaded resume file (PDF or plain text)
const extractResumeText = async (file) => {
  if (!file) return '';

  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  return file.buffer.toString('utf-8');
};

// Structured schema the model must fill in — this is what powers both the
// chat preview and the PDF export, so the model never returns loose markdown.
const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    chatReply: {
      type: Type.STRING,
      description:
        'A short, conversational reply (2-4 sentences) to the user explaining what you changed and why, as if you were a helpful career coach chatting with them.',
    },
    resume: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        contact: {
          type: Type.STRING,
          description: 'Single line: email | phone | LinkedIn | GitHub etc., pipe-separated, only include what candidate provided.',
        },
        summary: { type: Type.STRING },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: 'e.g. "Languages", "Frameworks", "Tools"' },
              items: { type: Type.STRING, description: 'comma-separated list' },
            },
            required: ['category', 'items'],
          },
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              organization: { type: Type.STRING },
              dates: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['title', 'organization', 'bullets'],
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              techStack: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name', 'bullets'],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              dates: { type: Type.STRING },
              detail: { type: Type.STRING, description: 'e.g. CGPA, honors' },
            },
            required: ['institution', 'degree'],
          },
        },
        extras: {
          type: Type.ARRAY,
          description: 'Any other sections like Leadership, Competitive Programming, Certifications, Achievements',
          items: {
            type: Type.OBJECT,
            properties: {
              sectionTitle: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['sectionTitle', 'bullets'],
          },
        },
      },
      required: ['fullName', 'summary', 'skills'],
    },
  },
  required: ['chatReply', 'resume'],
};

const SYSTEM_PROMPT = `You are an expert resume writer and career coach helping a candidate tailor their resume for a specific job through an ongoing conversation.

Strict rules:
- NEVER invent companies, job titles, degrees, dates, or skills the candidate did not mention at some point in the conversation.
- You MAY rephrase, reorder, quantify more clearly, and emphasize existing real experience that matches the job description.
- Mirror relevant keywords from the job description only where the candidate's real experience genuinely supports it.
- Use strong action verbs. Do not fabricate numbers/metrics that weren't implied by the candidate.
- Always return the FULL current state of the resume (not a diff) in the "resume" field, structured per the schema, reflecting all changes made so far across the whole conversation.
- Use the "chatReply" field to briefly explain what you changed in response to the latest message, in a warm, conversational tone — this is what the user reads in the chat, not the resume itself.
- If the user asks something unrelated to resume editing, politely steer back to resume tailoring in chatReply, but still return the unchanged resume.`;

const buildContents = (history) => {
  // history: [{ role: 'user' | 'model', text: string }]
  return history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
};

const callGemini = async (history) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildContents(history),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: resumeSchema,
      maxOutputTokens: 4000,
    },
  });

  const raw = response.text;
  if (!raw) {
    const err = new Error('AI service returned an empty response. Please try again.');
    err.statusCode = 502;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const err = new Error('AI service returned an unexpected format. Please try again.');
    err.statusCode = 502;
    throw err;
  }

  return parsed;
};

// @desc    Start a new resume-tailoring conversation from a resume + job description
// @route   POST /api/resume/tailor
// @access  Private
const tailorResume = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500);
      throw new Error('AI resume feature is not configured on the server. Missing GEMINI_API_KEY.');
    }

    const { jobDescription, pastedResumeText } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      res.status(400);
      throw new Error('Job description is required');
    }

    let resumeText = '';
    if (req.file) {
      resumeText = await extractResumeText(req.file);
    } else if (pastedResumeText) {
      resumeText = pastedResumeText;
    }

    if (!resumeText || !resumeText.trim()) {
      res.status(400);
      throw new Error('Please upload a resume file or paste your resume text');
    }

    const trimmedResume = resumeText.slice(0, 15000);
    const trimmedJD = jobDescription.slice(0, 6000);

    const initialUserMessage = `Here is my current resume:\n"""\n${trimmedResume}\n"""\n\nHere is the job description I'm targeting:\n"""\n${trimmedJD}\n"""\n\nPlease tailor my resume for this role.`;

    const history = [{ role: 'user', text: initialUserMessage }];

    const parsed = await callGemini(history);

    res.json({
      chatReply: parsed.chatReply,
      resume: parsed.resume,
      history: [...history, { role: 'model', text: JSON.stringify(parsed) }],
    });
  } catch (error) {
    if (error.message && error.message.includes('API key not valid')) {
      error.message = 'Invalid Gemini API key. Please check GEMINI_API_KEY in your server .env file.';
    }
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// @desc    Continue an existing resume-tailoring conversation with a follow-up instruction
// @route   POST /api/resume/chat
// @access  Private
const chatResume = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500);
      throw new Error('AI resume feature is not configured on the server. Missing GEMINI_API_KEY.');
    }

    const { message, history } = req.body;

    if (!message || !message.trim()) {
      res.status(400);
      throw new Error('Message is required');
    }

    if (!Array.isArray(history) || history.length === 0) {
      res.status(400);
      throw new Error('Conversation history is missing. Please start a new session.');
    }

    const updatedHistory = [...history, { role: 'user', text: message.slice(0, 3000) }];

    const parsed = await callGemini(updatedHistory);

    res.json({
      chatReply: parsed.chatReply,
      resume: parsed.resume,
      history: [...updatedHistory, { role: 'model', text: JSON.stringify(parsed) }],
    });
  } catch (error) {
    if (error.message && error.message.includes('API key not valid')) {
      error.message = 'Invalid Gemini API key. Please check GEMINI_API_KEY in your server .env file.';
    }
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = { tailorResume, chatResume };
