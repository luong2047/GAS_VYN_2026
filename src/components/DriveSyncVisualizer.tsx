import React, { useState, useEffect } from 'react';
import { 
  Cloud, Cpu, RefreshCw, Layers, CheckCircle2, 
  Settings, FolderKanban, AlertCircle, HardDrive, 
  HelpCircle, ShieldCheck, Download, Upload, Info
} from 'lucide-react';
import { SyncLog } from '../types';

interface DriveSyncVisualizerProps {
  onTriggerMockSync: (direction: 'upload' | 'download', onComplete: (logs: string) => void) => void;
  syncHistory: SyncLog[];
}

export const DriveSyncVisualizer: React.FC<DriveSyncVisualizerProps> = ({
  onTriggerMockSync,
  syncHistory,
}) => {
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [syncProgress, setSyncProgress] = useState<'idle' | 'enqueued' | 'running' | 'success' | 'failed'>('idle');
  const [activeDirection, setActiveDirection] = useState<'upload' | 'download'>('upload');
  const [workerProgress, setWorkerProgress] = useState(0);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictChoice, setConflictChoice] = useState<'client' | 'server'>('client');
  const [sysLogs, setSysLogs] = useState<string[]>([
    "Initial WorkManager service started successfully",
    "GMS Authenticator listener: listening for client sessions"
  ]);

  const connectGoogleDrive = () => {
    setIsDriveConnected(true);
    addLog("Google OAuth: Successfully resolved client access token with AppData folder permission");
  };

  const disconnectDrive = () => {
    setIsDriveConnected(false);
    addLog("Google OAuth: Revoked active credentials and cleared cache tokens");
  };

  const addLog = (msg: string) => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const time = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    setSysLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Simulating the background WorkManager steps
  const triggerSync = (direction: 'upload' | 'download') => {
    if (!isDriveConnected) {
      addLog("Sync Error: Google Drive offline. Authenticate first.");
      return;
    }

    setActiveDirection(direction);
    setSyncProgress('enqueued');
    setWorkerProgress(0);
    addLog(`WorkManager: Enqueued background task for unique session ID : drive_db_sync`);
    addLog(`WorkManager constraints validated: WIFI connected, power adequate.`);

    setTimeout(() => {
      setSyncProgress('running');
      addLog(`WorkManager Worker: RUNNING -> Executing sync db loop (${direction.toUpperCase()})`);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setWorkerProgress(progress);
        addLog(`SyncWorker: Buffer packet streams processing - ${progress}% accomplished`);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          onTriggerMockSync(direction, (details) => {
            setSyncProgress('success');
            addLog(`WorkManager Worker: SUCCESS -> ${details}`);
            addLog(`Room database handles refreshed. Standby mode active.`);
          });
        }
      }, 300);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cloud className="text-indigo-650 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Google Drive Sync & WorkManager</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Coordinates SQLite Room backups and updates multi-device synchronization structures securely.
          </p>
        </div>

        {/* Authentication Panel */}
        <div className="flex items-center space-x-2">
          {isDriveConnected ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 p-1.5 px-3 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Drive Linked</span>
              <button
                onClick={disconnectDrive}
                className="text-[10px] bg-red-50 text-red-750 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200/80 transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={connectGoogleDrive}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Cpu className="w-4 h-4" />
              <span>Link Google Account</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left column: sync operations control */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Sync Actions Panel</h4>
              <span className="text-[10px] bg-white text-slate-500 border border-slate-200 font-mono p-1 rounded font-bold uppercase">
                AppData Mode
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Force Upload Button */}
              <button
                onClick={() => triggerSync('upload')}
                disabled={syncProgress === 'enqueued' || syncProgress === 'running'}
                className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-center group transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Upload className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs text-slate-800 font-bold">Backup to Cloud</span>
                <span className="text-[9px] text-slate-450 mt-1 font-medium font-mono">Room DB &rarr; Drive</span>
              </button>

              {/* Force Download Button */}
              <button
                onClick={() => triggerSync('download')}
                disabled={syncProgress === 'enqueued' || syncProgress === 'running'}
                className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-center group transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Download className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs text-slate-800 font-bold">Download Cloud Backup</span>
                <span className="text-[9px] text-slate-450 mt-1 font-medium font-mono">Drive &rarr; Local DB</span>
              </button>
            </div>

            {/* Simulated progress tracker */}
            {syncProgress !== 'idle' && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-3xs">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-medium">WorkManager Status:</span>
                  <span className={`font-bold uppercase tracking-wider ${
                    syncProgress === 'enqueued' && 'text-amber-600'
                  } ${
                    syncProgress === 'running' && 'text-indigo-600 animate-pulse'
                  } ${
                    syncProgress === 'success' && 'text-emerald-600'
                  }`}>
                    {syncProgress}
                  </span>
                </div>

                {syncProgress === 'running' && (
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${workerProgress}%` }}
                    ></div>
                  </div>
                )}
                
                {syncProgress === 'success' && (
                  <p className="text-[10px] text-emerald-700 font-bold text-center flex items-center justify-center space-x-1 font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Background Sync Transaction Complete!</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Conflict Choice simulation */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <span>Sync Rules & Conflict Resolution</span>
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">
              When differences exist between multi-device database timestamps:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setConflictChoice('client')}
                className={`py-2 px-3 text-left border rounded-xl text-xs transition-all cursor-pointer ${
                  conflictChoice === 'client' 
                    ? 'bg-indigo-50/70 border-indigo-400 text-indigo-900 shadow-3xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="font-bold">Client Wins (Upload Override)</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Overrides files with local contents.</div>
              </button>
              <button
                onClick={() => setConflictChoice('server')}
                className={`py-2 px-3 text-left border rounded-xl text-xs transition-all cursor-pointer ${
                  conflictChoice === 'server' 
                    ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-3xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="font-bold">Cloud Wins (Merge Download)</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Pulls cloud copy & overrides local.</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: background architecture console log */}
        <div className="flex flex-col h-full justify-between space-y-4">
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-850 p-4 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Background System Logs</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            </div>

            <div className="flex-1 font-mono text-[10px] text-slate-350 divide-y divide-slate-900 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {sysLogs.map((log, index) => (
                <div key={index} className="py-2 hover:bg-slate-900/20 text-[#eceff4] text-left">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-150/80 text-xs text-indigo-850 leading-relaxed flex items-start space-x-2 font-medium">
            <Info className="w-4 h-4 text-indigo-550 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong>Production Google Drive Scope Policy:</strong> We restrict API boundaries strictly to <code className="text-indigo-805 font-mono bg-indigo-50 px-1 py-0.5 rounded">drive.appdata</code> scope. This is a private sandbox folder inside Drive invisible to standard user operations, preventing active SQLite file overrides, accidental deletion, or file congestion.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
