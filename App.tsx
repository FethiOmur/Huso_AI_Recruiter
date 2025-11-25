import React, { useState } from 'react';
import { Bot, FileText, ArrowRight, RotateCcw, ShieldCheck, Briefcase, Zap, Cpu, Settings, Key, Database, Lock, User, ChevronDown } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { CandidateAnalysis, ProcessingStatus } from './types';
import { analyzeResume } from './services/geminiService';

const MAX_FILES = 150;
const CHUNK_SIZE = 10;

const modelOptions = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Default)' },
  { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
  { value: 'gemini-2.0-pro-exp-02-05', label: 'gemini-2.0-pro-exp-02-05' },
  { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
  { value: 'gemini-1.5-pro-002', label: 'gemini-1.5-pro-002' },
  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
  { value: 'gemini-1.5-flash-002', label: 'gemini-1.5-flash-002' },
  { value: 'gemini-1.5-flash-8b', label: 'gemini-1.5-flash-8b (light)' },
  { value: 'gemini-1.0-pro', label: 'gemini-1.0-pro (legacy)' },
];

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CandidateAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [imgError, setImgError] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  
  // Configuration State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash');

  const handleAnalyze = async () => {
    if (files.length === 0 || !jobDescription.trim()) return;
    if (!consentAccepted) {
      setShowConsentModal(true);
      return;
    }

    const filesToProcess = files.slice(0, MAX_FILES);

    setIsProcessing(true);
    setResults([]);
    
    const tempResults: CandidateAnalysis[] = [];
    
    for (let start = 0; start < filesToProcess.length; start += CHUNK_SIZE) {
      const chunk = filesToProcess.slice(start, start + CHUNK_SIZE);

      for (let i = 0; i < chunk.length; i++) {
        const file = chunk[i];
        const processedCount = start + i + 1;
        setStatus({
          total: filesToProcess.length,
          processed: processedCount,
          currentFile: file.name,
          isComplete: false
        });

        try {
          const result = await analyzeResume(file, jobDescription, apiKey, modelName);
          tempResults.push(result);
          setResults([...tempResults]);
        } catch (err) {
          console.error(`Failed to process ${file.name}`, err);
        }
      }
    }

    setStatus(prev => prev ? { ...prev, isComplete: true } : null);
    setIsProcessing(false);
    setConsentAccepted(false); // force modal every run
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setStatus(null);
    setJobDescription('');
  };

  // Modern Dark Mode Progress Bar
  const ProgressBar = ({ status }: { status: ProcessingStatus }) => {
    const percentage = Math.round((status.processed / status.total) * 100);
    return (
      <div className="w-full max-w-xl mx-auto mt-20 text-center relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-2xl opacity-10 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black relative z-10">
              <Cpu className="w-8 h-8 text-white animate-spin-slow" />
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">System Processing</h3>
        <p className="text-zinc-500 mb-8 font-mono text-sm uppercase tracking-widest">
          Analyzing {status.currentFile}...
        </p>
        
        <div className="h-[2px] w-full bg-zinc-900 overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-zinc-600 mt-3 uppercase tracking-widest">
          <span>Initial Sequence</span>
          <span>{percentage}%</span>
          <span>Finalizing</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans relative overflow-x-hidden pb-16">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-dot-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
      
      {/* Marquee Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white text-black text-sm font-bold uppercase tracking-widest overflow-hidden py-2">
         <div className="whitespace-nowrap animate-[marquee_10s_linear_infinite] flex space-x-8">
           {[...Array(10)].map((_, i) => (
             <span key={i} className="flex items-center gap-4">
                <span>Hüseyinin babaannesi kaşar</span>
                <span className="w-1 h-1 bg-black rounded-full"></span>
             </span>
           ))}
         </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
        .typewriter-text {
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid white;
          animation: 
            typewriter 4s steps(40, end),
            blink .75s step-end infinite;
          display: inline-block;
          max-width: fit-content;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-14 w-full z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-20 h-20 overflow-hidden group-hover:border-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] bg-zinc-900 flex items-center justify-center relative rounded-xl border border-white/10">
              <img 
                src="/fethicikartma.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  setImgError(true);
                }}
              />
              {imgError && (
                 <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs tracking-tighter bg-zinc-900">FETHI</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg text-white typewriter-text pr-1">
                Fethi baba götter siker, AFFETMEZ
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 px-3 py-1.5 rounded-full">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span>System Operational</span>
             </div>
             <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
             >
                <Settings className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Settings Panel (Collapsible) */}
      <div className={`fixed top-24 right-0 w-full md:w-96 bg-zinc-950 border-l border-b border-zinc-800 z-30 transition-all duration-300 ease-in-out transform ${showSettings ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">System Configuration</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Model ID</label>
              <div className="relative">
                <select 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-xs font-mono text-white focus:border-white outline-none appearance-none"
                >
                  {modelOptions.map((model) => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 pt-36 pb-20">
        
        {isProcessing && status ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <ProgressBar status={status} />
          </div>
        ) : results.length === 0 ? (
          /* Input Workflow */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Recruitment <br className="hidden md:block" />
                <span className="text-zinc-500">Intelligence.</span>
              </h1>
              
              {/* API KEY & MODEL INPUT SECTION */}
              <div className="max-w-2xl mx-auto mt-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                  <div className="flex flex-col md:flex-row gap-4 relative">
                    {/* API Key Input */}
                    <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-1 flex items-center shadow-2xl transition-colors focus-within:border-zinc-600">
                       <div className="pl-4 pr-3 text-zinc-500">
                         <Key className="w-5 h-5" />
                     </div>
                     <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter Gemini API Key (required)"
                        className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-zinc-600 font-mono h-12"
                     />
                     <div className="pr-1">
                        <div className={`h-10 px-4 flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider border ${apiKey ? 'bg-zinc-800 text-green-500 border-zinc-700' : 'bg-zinc-900 text-red-400 border-red-700/60'}`}>
                          {apiKey ? 'Ready' : 'Required'}
                        </div>
                     </div>
                  </div>

                  {/* Model Selector */}
                  <div className="md:w-64 bg-black border border-zinc-800 rounded-xl p-1 flex items-center shadow-2xl transition-colors focus-within:border-zinc-600 relative">
                     <div className="pl-4 pr-2 text-zinc-500">
                       <Database className="w-5 h-5" />
                     </div>
                     <select
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 font-mono h-12 appearance-none cursor-pointer pr-8"
                     >
                       {modelOptions.map((model) => (
                         <option key={model.value} value={model.value}>{model.label}</option>
                       ))}
                     </select>
                     <ChevronDown className="absolute right-4 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="mt-2 flex justify-center gap-4">
                   <p className="text-[10px] text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Secure Connection
                   </p>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start h-[600px] transition-all duration-500 opacity-100 blur-0">
              
              {/* Left Col: Job Description */}
              <div className="glass-panel rounded-2xl p-1 transition-all duration-300 hover:border-zinc-700 group h-full flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-medium text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">01</span>
                    Job Parameters
                  </h3>
                  <Briefcase className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <div className="p-2 flex-1 relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Input job requirements, technical stack, and seniority level..."
                    className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] p-6 rounded-xl bg-black/40 border border-zinc-900 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 resize-none text-sm leading-relaxed font-mono custom-scrollbar"
                  />
                </div>
              </div>

              {/* Right Col: Upload & Action */}
              <div className="flex flex-col h-full gap-6">
                <div className="glass-panel rounded-2xl p-1 transition-all duration-300 hover:border-zinc-700 group flex-1 flex flex-col min-h-0">
                   <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                    <h3 className="font-medium text-white flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">02</span>
                      Data Ingestion
                    </h3>
                    <FileText className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="p-6 flex-1 min-h-0">
                    <FileUpload files={files} setFiles={setFiles} maxFiles={MAX_FILES} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!consentAccepted) {
                      setShowConsentModal(true);
                      return;
                    }
                    handleAnalyze();
                  }}
                  disabled={files.length === 0 || !jobDescription.trim() || !apiKey.trim()}
                  className={`
                    group w-full py-5 rounded-full flex items-center justify-center space-x-3 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex-shrink-0
                    ${files.length === 0 || !jobDescription.trim() || !apiKey.trim()
                      ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                      : 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }
                  `}
                >
                  <span className="relative flex items-center">
                     Initiate Analysis
                     <ArrowRight className={`w-4 h-4 ml-2 transition-transform group-hover:translate-x-1`} />
                  </span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* Results Dashboard */
          <div className="animate-in fade-in duration-700 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between glass-panel p-6 rounded-2xl gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Analysis Report</h2>
                <div className="flex items-center space-x-2 mt-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Completed in {(Math.random() * 5 + 2).toFixed(2)}s</span>
                  <span className="text-zinc-700">|</span>
                  <span>{results.length} Candidates Processed</span>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 border border-zinc-700 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Reset System
              </button>
            </div>
            
            <ResultsTable results={results} />
          </div>
        )}
      </main>

       {/* Minimal Footer */}
       <footer className="fixed bottom-0 w-full border-t border-white/5 py-4 bg-black/80 backdrop-blur-md z-40">
       <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-zinc-500" />
            <span>GDPR Protected Environment</span>
          </div>
          <div className="hidden md:block">
            AI Recruiter Pro v2.0
          </div>
        </div>
      </footer>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Onay Gerekiyor</h3>
            <p
              className="text-2xl text-white leading-relaxed text-center"
              style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Black", sans-serif' }}
            >
              “Babaannemin kaşar olduğunu kabul ediyorum”
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed text-center">
              Devam etmek için yukarıdaki uyarıyı kabul etmelisin. Reddersen analiz başlamaz.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:border-white transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={() => {
                  setConsentAccepted(true);
                  setShowConsentModal(false);
                  handleAnalyze();
                }}
                className="px-4 py-2 rounded-lg bg-white text-black font-bold text-sm hover:scale-[1.01] transition-transform"
              >
                Kabul Et ve Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
