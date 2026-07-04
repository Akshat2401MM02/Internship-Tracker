import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  Download,
  AlertCircle,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ResumePreview from '../components/ResumePreview';
import api from '../api/axios';

const AIResume = () => {
  // Setup phase state
  const [resumeFile, setResumeFile] = useState(null);
  const [pastedResumeText, setPastedResumeText] = useState('');
  const [inputMode, setInputMode] = useState('upload');
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef(null);

  // Session state
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]); // [{ role: 'user'|'model', text }]
  const [history, setHistory] = useState([]); // raw Gemini-format history for API calls
  const [resume, setResume] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or .txt file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max size is 5MB.');
      return;
    }

    setError('');
    setResumeFile(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');

    if (!jobDescription.trim()) {
      setError('Please paste the job description');
      return;
    }
    if (inputMode === 'upload' && !resumeFile) {
      setError('Please upload your resume file');
      return;
    }
    if (inputMode === 'paste' && !pastedResumeText.trim()) {
      setError('Please paste your resume text');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      if (inputMode === 'upload' && resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else {
        formData.append('pastedResumeText', pastedResumeText);
      }

      const { data } = await api.post('/resume/tailor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResume(data.resume);
      setHistory(data.history);
      setMessages([{ role: 'model', text: data.chatReply }]);
      setStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/resume/chat', {
        message: userMessage,
        history,
      });

      setResume(data.resume);
      setHistory(data.history);
      setMessages((prev) => [...prev, { role: 'model', text: data.chatReply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setMessages((prev) => prev.slice(0, -1)); // roll back the optimistic user message on failure
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!resume) return;
    setPdfLoading(true);
    setError('');
    try {
      const response = await api.post(
        '/resume/pdf',
        { resume },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tailored-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setMessages([]);
    setHistory([]);
    setResume(null);
    setResumeFile(null);
    setPastedResumeText('');
    setJobDescription('');
    setChatInput('');
    setError('');
  };

  // ---------- Setup screen ----------
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">AI Resume Tailor</h1>
              <p className="mt-1 text-sm text-gray-400">
                Start a conversation to tailor your resume, then refine it and download a PDF
              </p>
            </div>
          </div>

          <form onSubmit={handleStart} className="card flex flex-col gap-5 p-6">
            <div>
              <label className="label-text">Your Resume</label>

              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    inputMode === 'upload' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    inputMode === 'paste' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {inputMode === 'upload' ? (
                resumeFile ? (
                  <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <FileText className="h-4 w-4 text-primary-400" />
                      {resumeFile.name}
                    </div>
                    <button type="button" onClick={removeFile} className="text-gray-500 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 bg-gray-800/30 px-4 py-8 text-center hover:border-primary-500 hover:bg-gray-800/50">
                    <Upload className="h-6 w-6 text-gray-500" />
                    <span className="text-sm text-gray-400">
                      Click to upload <span className="text-primary-400">PDF or .txt</span>
                    </span>
                    <span className="text-xs text-gray-600">Max 5MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )
              ) : (
                <textarea
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  rows={8}
                  className="input-field"
                  placeholder="Paste your resume text here..."
                />
              )}
            </div>

            <div>
              <label className="label-text">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="input-field"
                placeholder="Paste the job description you're applying for..."
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting session...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Start Tailoring
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    );
  }

  // ---------- Chat + preview screen ----------
  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        {/* Chat panel */}
        <div className="flex w-full flex-col rounded-xl border border-gray-800 bg-gray-900 lg:w-1/2">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-gray-100">Resume Assistant</h2>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start Over
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-primary-400'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-800 text-primary-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-gray-800 px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-800 p-3">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g. Make the summary shorter, add more emphasis on leadership..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button type="submit" className="btn-primary px-3" disabled={loading || !chatInput.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Resume preview panel */}
        <div className="hidden flex-col rounded-xl border border-gray-800 bg-gray-900 lg:flex lg:w-1/2">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-100">Live Preview</h2>
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading || !resume}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-900 p-6">
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>

      {/* Mobile: floating download button since preview panel is hidden below lg */}
      <div className="border-t border-gray-800 bg-gray-900 p-3 lg:hidden">
        <button onClick={handleDownloadPdf} disabled={pdfLoading || !resume} className="btn-primary w-full">
          {pdfLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Tailored Resume (PDF)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIResume;
