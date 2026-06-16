import React, { useState } from 'react';
import { FileCode, Calendar, Play, Settings, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { SubtitleSegment } from '../types';

interface ParserPlaygroundProps {
  onParseTest: (content: string) => SubtitleSegment[];
}

const DEFAULT_SRT = `1
00:00:01,240 --> 00:00:04,890
Welcome to the <b>German Language</b> Listening Course.
In this lesson, we practice travel vocabulary.

2
00:00:05,100 --> 00:00:09,300
<i>Entschuldigung, wo ist der Bahnhof?</i>
Excuse me, where is the train station?

3
00:00:09,800 --> 00:00:13,200
Vielen Dank für Ihre Hilfe!
Thank you very much for your help!`;

const DEFAULT_VTT = `WEBVTT

1
00:00:01.120 --> 00:00:03.450
Bonjour! Comment ça va today?

2
00:00:04.050 --> 00:00:08.500
Je voudrais commander un café au lait, s'il vous plaît.
I would like to order a white coffee, please.`;

export const ParserPlayground: React.FC<ParserPlaygroundProps> = ({ onParseTest }) => {
  const [content, setContent] = useState(DEFAULT_SRT);
  const [segments, setSegments] = useState<SubtitleSegment[]>(onParseTest(DEFAULT_SRT));
  const [copied, setCopied] = useState(false);

  const handleParse = () => {
    const res = onParseTest(content);
    setSegments(res);
  };

  const loadPreset = (type: 'srt' | 'vtt') => {
    const text = type === 'srt' ? DEFAULT_SRT : DEFAULT_VTT;
    setContent(text);
    setSegments(onParseTest(text));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(segments, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <FileCode className="text-amber-600 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Subtitle Parser compiler</h3>
        </div>
        <p className="text-slate-500 text-xs mt-0.5">
          Test SRT or VTT compilation instantly. Highlights parse indices and strips timing intervals down to pure milliseconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Input Field */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Load Subtitle Format Preset:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => loadPreset('srt')}
                className="bg-white border border-slate-250 text-slate-705 hover:bg-slate-100 px-2.5 py-1 rounded text-[11px] font-mono transition-all shadow-3xs cursor-pointer font-semibold"
              >
                SRT Example
              </button>
              <button
                onClick={() => loadPreset('vtt')}
                className="bg-white border border-slate-250 text-slate-705 hover:bg-slate-100 px-2.5 py-1 rounded text-[11px] font-mono transition-all shadow-3xs cursor-pointer font-semibold"
              >
                VTT Example
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={11}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-inner"
              placeholder="Paste SRT or VTT content here..."
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono">
              {content.length} characters
            </div>
          </div>

          <button
            onClick={handleParse}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer active:scale-[0.99]"
          >
            Execute Subtitle Parser Engine
          </button>
        </div>

        {/* Right JSON compiled list */}
        <div className="space-y-3 flex flex-col h-full justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Compilation Output ({segments.length} structures parsed):</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="text-[10px] text-slate-650 hover:text-slate-850 hover:border-slate-350 flex items-center space-x-1 bg-white border border-slate-200 px-2 py-1 rounded shadow-3xs transition-all cursor-pointer font-semibold"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[250px] max-h-[300px] overflow-y-auto font-mono text-xs text-slate-350 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
            {segments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <p>Failed to parse any segments. Check your formatting timestamp headers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {segments.map((s, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-850/60 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-amber-400 font-bold">Segment #{s.index}</span>
                      <span className="text-slate-500">
                        {s.startTimeMs}ms &rarr; {s.endTimeMs}ms
                      </span>
                    </div>
                    {/* Cleaned text highlighting standard tags stripping */}
                    <p className="text-[#eceff4] text-xs select-text">{s.text}</p>
                    <div className="text-[10px] text-slate-400 flex space-x-3 pt-1 border-t border-slate-800/50">
                      <span>Start: <strong className="text-sky-300 font-mono">{(s.startTimeMs/1000).toFixed(2)}s</strong></span>
                      <span>End: <strong className="text-sky-300 font-mono">{(s.endTimeMs/1000).toFixed(2)}s</strong></span>
                      <span>Duration: <strong className="text-amber-200 font-mono">{((s.endTimeMs - s.startTimeMs)/1000).toFixed(2)}s</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Educational notice */}
          <div className="bg-indigo-50/30 p-3 rounded-xl border border-dashed border-indigo-150/80 text-[11px] text-indigo-805 leading-normal font-medium">
            <strong>Regex Compiler Rule:</strong> Our parser strip tags like <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded">&lt;b&gt;</code> and <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded">&lt;i&gt;</code> to prepare pure texts for display, avoiding layout breakages in Jetpack Compose text boxes. This behaves exactly the same as the Kotlin Regex replacement compiler in production.
          </div>

        </div>

      </div>
    </div>
  );
};
