import { useState, useRef } from 'react';
import { Sparkles, Upload, FileText, Loader2, Copy, Download, Check, AlertCircle, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const AIResume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [pastedResumeText, setPastedResumeText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');

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

      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI Resume Tailor</h1>
            <p className="mt-1 text-sm text-gray-400">
              Upload your resume and a job description to get a formatted, shortlist-optimized version
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <form onSubmit={handleSubmit} className="card flex flex-col gap-5 p-6">
            <div>
              <label className="label-text">Your Resume</label>

              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    inputMode === 'upload'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    inputMode === 'paste'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-200'
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
                  Tailoring your resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Tailored Resume
                </>
              )}
            </button>
          </form>

          {/* Output Panel */}
          <div className="card flex flex-col p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-200">Tailored Resume</h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 rounded-lg bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
                <p className="text-sm text-gray-400">Analyzing your resume against the job description...</p>
              </div>
            ) : result ? (
              <div className="max-h-[600px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-800/30 p-4 text-sm leading-relaxed text-gray-200">
                {result}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-gray-500">
                  <Sparkles className="h-7 w-7" />
                </div>
                <p className="max-w-xs text-sm text-gray-500">
                  Your tailored resume will appear here once generated
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIResume;
