const { GoogleGenAI } = require('@google/genai');
const pdfParse = require('pdf-parse');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Extract plain text from an uploaded resume file (PDF or plain text)
const extractResumeText = async (file) => {
  if (!file) return '';

  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  // Treat anything else (txt, doc content pasted as text, etc.) as plain text
  return file.buffer.toString('utf-8');
};

// @desc    Generate a tailored, ATS-friendly resume from an uploaded resume + job description
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

    // Guard against extremely large inputs
    const trimmedResume = resumeText.slice(0, 15000);
    const trimmedJD = jobDescription.slice(0, 6000);

    const systemPrompt = `You are an expert resume writer and career coach specializing in tailoring resumes for ATS (Applicant Tracking Systems) and human recruiters. Given a candidate's existing resume and a target job description, rewrite and reformat the resume to maximize their chances of being shortlisted, while staying strictly truthful to the candidate's actual experience.

Rules you must follow:
- NEVER invent companies, job titles, degrees, dates, or skills the candidate did not mention.
- You MAY rephrase, reorder, quantify more clearly, and emphasize existing experience that matches the job description.
- Mirror relevant keywords and phrasing from the job description where the candidate's real experience genuinely supports it.
- Use strong action verbs and quantify achievements wherever the original resume gives you enough information to do so honestly (do not fabricate numbers).
- Keep it concise and well-structured: Contact Info, Summary, Skills, Experience, Projects, Education (only include sections the candidate has content for).
- Output clean, well-formatted Markdown using headings (##), bold for role/company titles, and bullet points for achievements.
- After the resume, add a section "## Tailoring Notes" with 3-5 short bullet points explaining what you changed or emphasized and why, plus any honest gaps between the candidate's background and the job description that they should be aware of.`;

    const userPrompt = `Here is the candidate's current resume:\n\n"""\n${trimmedResume}\n"""\n\nHere is the target job description:\n\n"""\n${trimmedJD}\n"""\n\nPlease produce the tailored resume and tailoring notes as instructed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 4000,
      },
    });

    const resultText = response.text;

    if (!resultText) {
      res.status(502);
      throw new Error('AI service returned an empty response. Please try again.');
    }

    res.json({ result: resultText });
  } catch (error) {
    // Surface Gemini-specific quota/auth errors more clearly
    if (error.message && error.message.includes('API key not valid')) {
      error.message = 'Invalid Gemini API key. Please check GEMINI_API_KEY in your server .env file.';
    }
    next(error);
  }
};

module.exports = { tailorResume };
