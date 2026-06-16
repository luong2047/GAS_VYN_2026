import React, { useState } from 'react';
import { FileText, FolderTree, Code, Copy, Check, ChevronDown, BookOpen } from 'lucide-react';
import { SourceFile } from '../data/sourceCode';

interface CodeExplorerProps {
  sourceFiles: SourceFile[];
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ sourceFiles }) => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(sourceFiles[0]);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'database' | 'parser' | 'ui' | 'sync'>('all');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = activeCategory === 'all'
    ? sourceFiles
    : sourceFiles.filter(f => f.category === activeCategory);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FolderTree className="text-indigo-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Clean Architecture Core Codebase</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Browse and inspect production-ready Kotlin modules structured under Clean Architecture models (Data, Domain, Presentation).
          </p>
        </div>

        {/* Categories selector */}
        <div className="flex flex-wrap gap-1 bg-[#fbfcfd] p-1 rounded-xl border border-slate-200">
          {(['all', 'database', 'parser', 'ui', 'sync'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                const firstFound = sourceFiles.find(f => cat === 'all' || f.category === cat);
                if (firstFound) setSelectedFile(firstFound);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-550 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (File list) - 4 cols */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-start space-y-2 max-h-[500px] overflow-y-auto shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1 block">
            Kotlin Source Core ({filteredFiles.length} files)
          </span>

          <div className="space-y-1">
            {filteredFiles.map(file => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedFile.name === file.name 
                    ? 'bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500 font-bold shadow-3xs' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-3xs'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <FileText className={`w-4 h-4 shrink-0 ${
                    file.category === 'database' && 'text-emerald-600'
                  } ${
                    file.category === 'parser' && 'text-amber-500'
                  } ${
                    file.category === 'ui' && 'text-purple-500'
                  } ${
                    file.category === 'sync' && 'text-sky-500'
                  }`} />
                  <div className="truncate">
                    <p className={`truncate ${selectedFile.name === file.name ? 'text-indigo-905' : 'text-slate-800'}`}>{file.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">{file.path}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column (Code View) - 8 cols */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          
          {/* File details banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold font-mono text-slate-700 tracking-widest truncate max-w-[200px] md:max-w-none">{selectedFile.path}</span>
              </div>
              <button
                onClick={() => handleCopy(selectedFile.code)}
                className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer shadow-3xs"
                title="Copy Kotlin Code to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
              {selectedFile.description}
            </p>
          </div>

          {/* Actual Code View container */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col shadow-inner">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-850 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Kotlin Compiler v2.0+ Compliant</span>
              <span className="text-indigo-400 uppercase font-bold">{selectedFile.category} Module</span>
            </div>
            
            <pre className="p-4 font-mono text-xs text-indigo-200 overflow-auto max-h-[350px] scrollbar-thin scrollbar-thumb-slate-800 whitespace-pre text-left">
              <code>{selectedFile.code}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
