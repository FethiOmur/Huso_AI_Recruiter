import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, disabled, maxFiles }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const maxAllowed = maxFiles ?? Infinity;

  const addFiles = (incoming: File[]) => {
    const pdfs = incoming.filter((file: File) => file.type === 'application/pdf');
    if (pdfs.length === 0) return;
    const merged = [...files, ...pdfs].slice(0, maxAllowed);
    setFiles(merged);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
    // Reset the input value to allow re-selecting the same file if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div
        className={`
          relative flex-shrink-0 min-h-[180px] border border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-6 text-center
          ${disabled 
            ? 'border-zinc-800 bg-zinc-900/20 cursor-not-allowed opacity-50' 
            : isDragging
              ? 'border-white bg-white/5 scale-[0.99]'
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-white/[0.02] cursor-pointer'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="application/pdf"
          disabled={disabled}
        />
        
        <div className={`
          p-3 rounded-full mb-3 transition-all duration-300
          ${isDragging ? 'bg-white text-black scale-110' : 'bg-zinc-900 text-zinc-400 group-hover:text-white border border-zinc-800'}
        `}>
          <Upload className="w-6 h-6" />
        </div>
        
        <h4 className="text-white font-medium text-lg mb-1 tracking-tight">
          {isDragging ? 'Release to Upload' : 'Drop Resumes Here'}
        </h4>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
          PDF Format Supported {Number.isFinite(maxAllowed) ? `(Up to ${maxAllowed})` : ''}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 flex flex-col flex-1 min-h-0">
          <div className="flex justify-between items-center mb-2 px-1 flex-shrink-0">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Queue ({files.length}{Number.isFinite(maxAllowed) ? `/${maxAllowed}` : ''})</span>
             <button 
               onClick={() => setFiles([])}
               className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
               disabled={disabled}
             >
               Clear Queue
             </button>
          </div>
          <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-black border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">{file.name}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 text-zinc-600 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
