import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  ArrowLeft,
  BookOpen,
  Volume2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  HardDrive,
  Check,
  Smartphone,
  Eye,
  ListFilter,
  FileText,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  FileDown,
  FileUp,
  MoreVertical,
  Edit,
  Plus,
  Minus,
  Calendar,
  FolderOpen,
  Bold,
  Italic,
  Underline,
  Palette,
  Type,
  Trash2,
  Star,
  Menu,
  Search,
  X,
  Cloud,
  CloudDownload,
  CloudUpload,
  Download,
  Upload,
  Settings,
  Crop,
} from "lucide-react";
import { Topic, Article, SubtitleSegment, VocabularyItem, AccessLog } from "../types";
import splashImage from "../assets/images/rabbit_carrot_splash_1781691897305.jpg";

const ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=120&h=120&q=80", // Learning
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=120&h=120&q=80", // Reading
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&h=120&q=80", // Book
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=120&h=120&q=80", // Books stack
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=120&h=120&q=80", // Education study
];

export interface TestQuestion {
  vocabId: string;
  type: "word-to-meaning" | "meaning-to-word";
  prompt: string;
  correctAnswer: string;
  options: string[];
}

interface PhoneSimulatorProps {
  topics: Topic[];
  articles: Article[];
  accessLogs?: AccessLog[];
  onOpenArticle: (articleId: number) => void;
  subtitleParser: (v: string) => SubtitleSegment[];
  onUpdateArticle?: (
    id: number,
    title: string,
    type: "subtitle",
    content: string,
    imageUrl?: string,
    audioUrl?: string,
  ) => void;
  onAddArticle?: (
    topicId: number,
    title: string,
    type: "subtitle",
    content: string,
    imageUrl?: string,
    audioUrl?: string,
  ) => void;
  onDeleteArticle?: (id: number) => void;
  onUpdateVocabulary?: (
    articleId: number,
    vocabulary: VocabularyItem[],
  ) => void;
  onToggleMarkArticle?: (id: number) => void;
  onAddTopic?: (title: string, desc: string) => void;
  onUpdateTopic?: (id: number, title: string, desc: string) => void;
  onDeleteTopic?: (id: number) => void;
  onImportData?: (topics: Topic[], articles: Article[], accessLogs: AccessLog[]) => void;
  onGoogleDriveSync?: (direction: 'upload' | 'download', onComplete: (msg: string) => void) => void;
}

const CustomDatePicker: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  align?: 'left' | 'right';
}> = ({ label, value, onChange, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentDate(d);
      }
    }
  }, [value]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayOfMonth = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) {
    startOffset = 6;
  }

  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthCells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    prevMonthCells.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  const currentMonthCells = [];
  for (let i = 1; i <= totalDays; i++) {
    currentMonthCells.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  const remainingCells = 42 - (prevMonthCells.length + currentMonthCells.length);
  const nextMonthCells = [];
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthCells.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const allCells = [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];

  const handleSelectDay = (cell: { day: number; month: number; year: number; isCurrentMonth: boolean }) => {
    const selectedDate = new Date(cell.year, cell.month, cell.day);
    const yStr = selectedDate.getFullYear();
    const mStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="space-y-0.5 relative" ref={containerRef}>
      <span className="text-[9px] text-slate-400 block font-bold">
        {label}
      </span>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-[10px] bg-slate-50 border border-slate-200 hover:border-slate-300 rounded p-1 text-slate-700 cursor-pointer select-none transition-colors"
      >
        <span className="font-mono text-[10px] tracking-wide font-medium">
          {value || "yyyy-mm-dd"}
        </span>
        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-1 top-full ${align === 'left' ? 'left-0' : 'right-0'} w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150`}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevMonth();
              }}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3" />
            </button>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextMonth();
              }}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-bold text-indigo-500 uppercase">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {allCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div key={idx} className="aspect-square" />
                );
              }

              const cellDate = new Date(cell.year, cell.month, cell.day);
              const yStr = cellDate.getFullYear();
              const mStr = String(cellDate.getMonth() + 1).padStart(2, '0');
              const dStr = String(cellDate.getDate()).padStart(2, '0');
              const cellDateStr = `${yStr}-${mStr}-${dStr}`;
              const isSelected = value === cellDateStr;

              const todayObj = new Date();
              const isToday = 
                todayObj.getDate() === cell.day && 
                todayObj.getMonth() === cell.month && 
                todayObj.getFullYear() === cell.year;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(cell);
                  }}
                  className={`aspect-square text-[9px] font-bold rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-850 hover:bg-slate-150"
                  } ${
                    isToday 
                      ? (isSelected ? "ring-2 ring-indigo-600 ring-offset-1 rounded-md" : "border-2 border-indigo-600 rounded-md") 
                      : ""
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setIsOpen(false);
              }}
              className="w-full text-center text-[8px] font-bold text-red-500 hover:bg-red-55/90 py-1 rounded-lg transition-colors border border-red-105"
            >
              Clear Date
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  topics,
  articles,
  accessLogs = [],
  onOpenArticle,
  subtitleParser,
  onUpdateArticle,
  onAddArticle,
  onDeleteArticle,
  onUpdateVocabulary,
  onToggleMarkArticle,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onImportData,
  onGoogleDriveSync,
}) => {
  const [currentScreen, setCurrentScreen] = useState<
    | "topics"
    | "articles"
    | "article-detail"
    | "edit-article"
    | "vocabulary"
    | "topic-management"
    | "search-articles"
    | "settings"
    | "exited"
  >("topics");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [cameFromSearch, setCameFromSearch] = useState(false);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // VDB backup and manual Google Drive sync states
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [vdbStatus, setVdbStatus] = useState<{ type: 'success' | 'error' | 'loading' | null, message: string }>({ type: null, message: "" });
  const [syncStatus, setSyncStatus] = useState<{ isSyncing: boolean, direction: 'upload' | 'download' | null, progress: number, message: string }>({
    isSyncing: false,
    direction: null,
    progress: 0,
    message: ""
  });
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(() => {
    return localStorage.getItem("vdb_drive_connected") === "true";
  });
  const [showSyncSetupDialog, setShowSyncSetupDialog] = useState<boolean>(false);

  const compressData = async (text: string): Promise<Blob> => {
    if (typeof CompressionStream !== "undefined") {
      try {
        const stream = new Blob([text], { type: "application/json" }).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
        return await new Response(compressedStream).blob();
      } catch (e) {
        console.warn("CompressionStream failed, using raw Blob fallback:", e);
      }
    }
    return new Blob([text], { type: "application/json" });
  };

  const decompressData = async (blob: Blob): Promise<string> => {
    if (typeof DecompressionStream !== "undefined") {
      try {
        const decompressedStream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
        return await new Response(decompressedStream).text();
      } catch (e) {
        console.warn("DecompressionStream failed, using raw text fallback:", e);
      }
    }
    return await blob.text();
  };

  const handleExportVdb = async () => {
    setIsTopicsMenuOpen(false);
    setVdbStatus({ type: 'loading', message: "Packaging application data..." });
    try {
      const dataToExport = {
        topics,
        articles,
        accessLogs: accessLogs || []
      };
      const jsonString = JSON.stringify(dataToExport);
      const blob = await compressData(jsonString);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_${new Date().toISOString().slice(0, 10)}.vdb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setVdbStatus({ type: 'success', message: "Backup file (.vdb) exported successfully! Please choose where to save." });
      setTimeout(() => setVdbStatus({ type: null, message: "" }), 4000);
    } catch (err: any) {
      setVdbStatus({ type: 'error', message: `Export failed: ${err.message || err}` });
      setTimeout(() => setVdbStatus({ type: null, message: "" }), 4000);
    }
  };

  const handleImportVdb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTopicsMenuOpen(false);
    setVdbStatus({ type: 'loading', message: "Importing backup..." });
    try {
      const decompressedText = await decompressData(file);
      const parsed = JSON.parse(decompressedText);
      if (parsed.topics && parsed.articles) {
        if (onImportData) {
          onImportData(parsed.topics, parsed.articles, parsed.accessLogs || []);
          setVdbStatus({ type: 'success', message: "Database successfully fully restored and reloaded!" });
          setTimeout(() => {
            setVdbStatus({ type: null, message: "" });
            setCurrentScreen("topics");
            setSelectedTopic(null);
          }, 3000);
        } else {
          setVdbStatus({ type: 'error', message: "Importer callback is unavailable." });
          setTimeout(() => setVdbStatus({ type: null, message: "" }), 4000);
        }
      } else {
        setVdbStatus({ type: 'error', message: "Invalid backup format: missing required schemas." });
        setTimeout(() => setVdbStatus({ type: null, message: "" }), 4000);
      }
    } catch (err: any) {
      setVdbStatus({ type: 'error', message: "Failed: not a valid .vdb compressed file." });
      setTimeout(() => setVdbStatus({ type: null, message: "" }), 4500);
    }
    if (backupFileInputRef.current) {
      backupFileInputRef.current.value = "";
    }
  };

  const handleGoogleDriveSync = (direction: 'upload' | 'download') => {
    setIsTopicsMenuOpen(false);
    if (!isDriveConnected) {
      setSyncStatus({
        isSyncing: true,
        direction,
        progress: 10,
        message: "No linked Google Account found. Please set up account synchronization first!"
      });
      setTimeout(() => {
        setSyncStatus({ isSyncing: false, direction: null, progress: 0, message: "" });
        setShowSyncSetupDialog(true);
      }, 2500);
      return;
    }
    setSyncStatus({
      isSyncing: true,
      direction,
      progress: 5,
      message: `Establishing Google OAuth API token...`
    });

    const steps = [
      { p: 20, m: "Authenticating client workspace & AppData folder scopes..." },
      { p: 40, m: direction === 'upload' ? "Packaging local SQLite DB file..." : "Searching Drive AppData files for backup..." },
      { p: 65, m: direction === 'upload' ? "Uploading binary stream packet chunks..." : "Downloading latest master database backup..." },
      { p: 85, m: direction === 'upload' ? "Committing transaction log metadata..." : "Restoring dynamic schemas & access history logs..." },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSyncStatus(prev => ({
          ...prev,
          progress: steps[currentStep].p,
          message: steps[currentStep].m
        }));
        currentStep++;
      } else {
        clearInterval(interval);
        if (onGoogleDriveSync) {
          onGoogleDriveSync(direction, (details) => {
            setSyncStatus({
              isSyncing: true,
              direction,
              progress: 100,
              message: direction === 'upload' ? `Upload completed! ${details}` : `Download completed! Restored all database states.`
            });
            setTimeout(() => {
              setSyncStatus({ isSyncing: false, direction: null, progress: 0, message: "" });
            }, 3500);
          });
        } else {
          setSyncStatus({
            isSyncing: true,
            direction,
            progress: 100,
            message: `Synchronization simulated successfully!`
          });
          setTimeout(() => {
            setSyncStatus({ isSyncing: false, direction: null, progress: 0, message: "" });
          }, 3000);
        }
      }
    }, 450);
  };

  // Topics list top bar menu and modals
  const [isTopicsMenuOpen, setIsTopicsMenuOpen] = useState(false);
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Topic Management State
  const [topicManageMode, setTopicManageMode] = useState<
    "list" | "add" | "edit"
  >("list");
  const [selectedTopicToEdit, setSelectedTopicToEdit] = useState<Topic | null>(
    null,
  );
  const [topicAddTitle, setTopicAddTitle] = useState("");
  const [topicAddDesc, setTopicAddDesc] = useState("");

  // Article Search State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchTimeRange, setSearchTimeRange] = useState<
    "all" | "today" | "yesterday" | "this_week" | "this_month" | "this_year" | "marked"
  >("all");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMs, setPlaybackMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 1.25x, 1.5x etc
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const [parsedSegments, setParsedSegments] = useState<SubtitleSegment[]>([]);
  const [useRealTts, setUseRealTts] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState<
    "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl"
  >("text-sm");
  const [editorFontSize, setEditorFontSize] = useState<number>(13);
  const startPickerRef = useRef<HTMLInputElement>(null);
  const endPickerRef = useRef<HTMLInputElement>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("online-en");
  const [isLocalTtsActive, setIsLocalTtsActive] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("local_tts_initialized") === "true";
    }
    return false;
  });
  const [isInitializingLocalTts, setIsInitializingLocalTts] = useState<boolean>(false);
  const [selectedLocalVoiceURI, setSelectedLocalVoiceURI] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("default_local_voice_uri") || "google-en-us";
    }
    return "google-en-us";
  });
  const onlineTtsAudioRef = useRef<HTMLAudioElement | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"subtitle">("subtitle");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [rawUploadedImage, setRawUploadedImage] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const handleCropTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDraggingCrop(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - cropOffset.x, y: touch.clientY - cropOffset.y });
    }
  };

  const handleCropTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setCropOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleCropTouchEnd = () => {
    setIsDraggingCrop(false);
  };

  const handleSaveCrop = () => {
    if (!rawUploadedImage) return;
    const img = new Image();
    img.onload = () => {
      const imageNaturalWidth = img.naturalWidth;
      const imageNaturalHeight = img.naturalHeight;
      const imgRatio = imageNaturalWidth / imageNaturalHeight;
      const viewRatio = 320 / 144;
      
      let fitW = 320;
      let fitH = 144;
      if (imgRatio > viewRatio) {
        fitW = 320;
        fitH = 320 / imgRatio;
      } else {
        fitW = 144 * imgRatio;
        fitH = 144;
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 288;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 640, 288);
        
        const scaleFactor = 2;
        const xCanvas = ((320 - fitW * cropZoom) / 2 + cropOffset.x) * scaleFactor;
        const yCanvas = ((144 - fitH * cropZoom) / 2 + cropOffset.y) * scaleFactor;
        const wCanvas = (fitW * cropZoom) * scaleFactor;
        const hCanvas = (fitH * cropZoom) * scaleFactor;
        
        ctx.drawImage(img, xCanvas, yCanvas, wCanvas, hCanvas);
        
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setEditImageUrl(dataUrl);
        } catch (e) {
          console.error("Canvas export failed: ", e);
          setEditImageUrl(rawUploadedImage);
        }
      }
      setRawUploadedImage(null);
    };
    img.src = rawUploadedImage;
  };
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#ef4444");

  // Vocabulary list management states
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");
  const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState("");
  const [editingDefinition, setEditingDefinition] = useState("");
  const [editingExample, setEditingExample] = useState("");

  // Practice & Test States
  const [isReadingAll, setIsReadingAll] = useState(false);
  const isReadingAllRef = useRef(false);
  const [autoReadIndex, setAutoReadIndex] = useState<number>(-1);
  const [isTesting, setIsTesting] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<{
    correct: number;
    incorrect: number;
    percentage: number;
  } | null>(null);
  const [vocabFontSize, setVocabFontSize] = useState<string>("text-[13px]");
  const [isVocabMenuOpen, setIsVocabMenuOpen] = useState(false);
  const [isInsertExpressionExpanded, setIsInsertExpressionExpanded] = useState(true);

  // Swipe detection refs for touch/mouse gestures
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null)
      return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Swipe left: navigate to vocabulary list
    if (diffX > 80 && Math.abs(diffX) > Math.abs(diffY)) {
      if (currentScreen === "article-detail") {
        setCurrentScreen("vocabulary");
      }
    }
    // Swipe right: navigate back to article detail from vocabulary list
    if (diffX < -80 && Math.abs(diffX) > Math.abs(diffY)) {
      if (currentScreen === "vocabulary") {
        setCurrentScreen("article-detail");
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only track left click
    if (e.button !== 0) return;
    // Check if target is inside form input, text area, or buttons to avoid hijacking user type inputs
    const tagName = (e.target as HTMLElement).tagName.toLowerCase();
    if (
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "button" ||
      (e.target as HTMLElement).closest(".vocab-item-actions")
    )
      return;

    touchStartXRef.current = e.clientX;
    touchStartYRef.current = e.clientY;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null)
      return;
    const diffX = touchStartXRef.current - e.clientX;
    const diffY = touchStartYRef.current - e.clientY;

    // Swipe left: nav to vocabulary
    if (diffX > 80 && Math.abs(diffX) > Math.abs(diffY)) {
      if (currentScreen === "article-detail") {
        setCurrentScreen("vocabulary");
      }
    }
    // Swipe right: nav back
    if (diffX < -80 && Math.abs(diffX) > Math.abs(diffY)) {
      if (currentScreen === "vocabulary") {
        setCurrentScreen("article-detail");
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleAddVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !newWord.trim() || !newDefinition.trim()) return;

    const newItem: VocabularyItem = {
      id: Math.random().toString(36).substr(2, 9),
      word: newWord.trim(),
      definition: newDefinition.trim(),
      exampleSentence: newExample.trim() || undefined,
    };

    const currentVocab = selectedArticle.vocabulary || [];
    const updatedVocab = [...currentVocab, newItem];

    // Update parent
    if (onUpdateVocabulary) {
      onUpdateVocabulary(selectedArticle.id, updatedVocab);
    }
    // Update local state
    setSelectedArticle((prev) =>
      prev ? { ...prev, vocabulary: updatedVocab } : null,
    );

    // Clear form
    setNewWord("");
    setNewDefinition("");
    setNewExample("");
  };

  const handleDeleteVocab = (vocabId: string) => {
    if (!selectedArticle) return;
    const currentVocab = selectedArticle.vocabulary || [];
    const updatedVocab = currentVocab.filter((item) => item.id !== vocabId);

    if (onUpdateVocabulary) {
      onUpdateVocabulary(selectedArticle.id, updatedVocab);
    }
    setSelectedArticle((prev) =>
      prev ? { ...prev, vocabulary: updatedVocab } : null,
    );
  };

  const handleStartEditVocab = (item: VocabularyItem) => {
    setEditingVocabId(item.id);
    setEditingWord(item.word);
    setEditingDefinition(item.definition);
    setEditingExample(item.exampleSentence || "");
  };

  const handleSaveEditVocab = () => {
    if (
      !selectedArticle ||
      !editingVocabId ||
      !editingWord.trim() ||
      !editingDefinition.trim()
    )
      return;
    const currentVocab = selectedArticle.vocabulary || [];
    const updatedVocab = currentVocab.map((item) => {
      if (item.id === editingVocabId) {
        return {
          ...item,
          word: editingWord.trim(),
          definition: editingDefinition.trim(),
          exampleSentence: editingExample.trim() || undefined,
        };
      }
      return item;
    });

    if (onUpdateVocabulary) {
      onUpdateVocabulary(selectedArticle.id, updatedVocab);
    }
    setSelectedArticle((prev) =>
      prev ? { ...prev, vocabulary: updatedVocab } : null,
    );

    // Clear editing
    setEditingVocabId(null);
  };

  // Get active voice URI for selected article (falls back to global selectedVoiceURI)
  const getActiveVoiceURI = () => {
    if (!selectedArticle) return selectedVoiceURI || "online-en";
    const saved = localStorage.getItem("article_voice_" + selectedArticle.id);
    if (saved) return saved;
    return selectedVoiceURI || "online-en";
  };

  const getActiveLocalVoiceURI = () => {
    if (!selectedArticle) return selectedLocalVoiceURI || "google-en-us";
    const saved = localStorage.getItem("article_local_voice_" + selectedArticle.id);
    if (saved) return saved;
    return selectedLocalVoiceURI || "google-en-us";
  };

  const handleLocalVoiceChange = (val: string) => {
    setSelectedLocalVoiceURI(val);
    localStorage.setItem("default_local_voice_uri", val);
    if (selectedArticle) {
      localStorage.setItem("article_local_voice_" + selectedArticle.id, val);
    }

    // Automatically initialize/warm-up the speech-voice related to the selected language
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        // Warm-up synthesis with a silent space
        const warmUpUtterance = new SpeechSynthesisUtterance(" ");
        warmUpUtterance.volume = 0; // complete silence
        warmUpUtterance.rate = 2.0;  // ultra fast so it is instant
        
        const allSysVoices = window.speechSynthesis.getVoices();
        let foundVoice = allSysVoices.find((v) => v.voiceURI === val);
        if (!foundVoice && val) {
          let tag = "en";
          if (val.startsWith("google-")) {
            const m = val.match(/^google-([a-z]{2}(-[a-z]{2})?)/);
            if (m) tag = m[1];
          } else {
            tag = val;
          }
          foundVoice = allSysVoices.find(
            (v) => v.lang.toLowerCase() === tag.toLowerCase() ||
                   v.lang.toLowerCase().replace("_", "-") === tag.toLowerCase() ||
                   v.lang.toLowerCase().startsWith(tag.toLowerCase().split("-")[0])
          );
        }

        if (foundVoice) {
          warmUpUtterance.voice = foundVoice;
        }
        window.speechSynthesis.speak(warmUpUtterance);
        console.log("Successfully pre-initialized speech-voice for:", val, foundVoice?.name);
      } catch (err) {
        console.warn("Speech voice audio stream warm-up failed:", err);
      }
    }
  };

  const getAvailableLocalVoices = () => {
    const systemVoices = voices || [];
    
    // Check if the system already contains directly branded Google TTS voices (like on physical Android devices)
    const brandedGoogle = systemVoices.filter((v) => 
      v.name.toLowerCase().includes("google")
    );
    if (brandedGoogle.length > 0) {
      return brandedGoogle;
    }

    // Standard list of high-quality Google TTS languages to offer elegant option-mapping
    const googleTtsLanguages = [
      { name: "Google English US (en-US)", lang: "en-US", voiceURI: "google-en-us" },
      { name: "Google English UK (en-GB)", lang: "en-GB", voiceURI: "google-en-gb" },
      { name: "Google Spanish (es-ES)", lang: "es-ES", voiceURI: "google-es-es" },
      { name: "Google French (fr-FR)", lang: "fr-FR", voiceURI: "google-fr-fr" },
      { name: "Google Japanese (ja-JP)", lang: "ja-JP", voiceURI: "google-ja-jp" },
      { name: "Google Chinese (zh-CN)", lang: "zh-CN", voiceURI: "google-zh-cn" },
      { name: "Google Korean (ko-KR)", lang: "ko-KR", voiceURI: "google-ko-kr" },
      { name: "Google Vietnamese (vi-VN)", lang: "vi-VN", voiceURI: "google-vi-vn" }
    ];

    // For each of our clean Google TTS languages, match them to any valid system speech voice to guarantee playability!
    return googleTtsLanguages.map((gVoice) => {
      const matchedSystemVoice = systemVoices.find((sv) => 
        sv.lang.toLowerCase() === gVoice.lang.toLowerCase() ||
        sv.lang.toLowerCase().replace("_", "-") === gVoice.lang.toLowerCase() ||
        sv.lang.toLowerCase().startsWith(gVoice.lang.toLowerCase().split("-")[0])
      );
      if (matchedSystemVoice) {
        return {
          name: gVoice.name,
          lang: gVoice.lang,
          voiceURI: matchedSystemVoice.voiceURI // Bind to functional system voice URI!
        } as SpeechSynthesisVoice;
      }
      return gVoice as any as SpeechSynthesisVoice;
    });
  };

  // Speaks using the local Google TTS service of web speech synthesis
  const playLocalGoogleTts = (text: string, onEnd?: () => void, onError?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const activeLocalURI = getActiveLocalVoiceURI();

      const allSysVoices = window.speechSynthesis.getVoices();
      let foundVoice = allSysVoices.find((v) => v.voiceURI === activeLocalURI);

      if (!foundVoice && activeLocalURI) {
        let tag = "en";
        if (activeLocalURI.startsWith("google-")) {
          const m = activeLocalURI.match(/^google-([a-z]{2}(-[a-z]{2})?)/);
          if (m) tag = m[1];
        } else if (activeLocalURI.includes("(")) {
          const m = activeLocalURI.match(/\(([^)]+)\)/);
          if (m) tag = m[1];
        } else {
          tag = activeLocalURI;
        }

        foundVoice = allSysVoices.find(
          (v) => v.lang.toLowerCase() === tag.toLowerCase() ||
                 v.lang.toLowerCase().startsWith(tag.toLowerCase().split("-")[0])
        );
      }

      if (foundVoice) {
        utterance.voice = foundVoice;
      }

      if (onEnd) utterance.onend = onEnd;
      if (onError) utterance.onerror = onError;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Local TTS play exception:", err);
      if (onEnd) onEnd();
    }
  };

  // Speaks using the online Google Translate TTS service (which has high-fidelity internet pronunciation and bypasses mobile browser Web Speech API blocking)
  const playOnlineTts = (text: string, onEnd?: () => void, onError?: () => void) => {
    // Determine whether to use local or internet TTS
    const activeUseReal = selectedArticle
      ? (localStorage.getItem("article_use_real_tts_" + selectedArticle.id) === "true")
      : useRealTts;

    if (!activeUseReal) {
      playLocalGoogleTts(text, onEnd, onError);
      return;
    }

    const audio = onlineTtsAudioRef.current;
    if (!audio) {
      console.warn("onlineTtsAudioRef is not mounted yet, fallback to system tts");
      playLocalGoogleTts(text, onEnd, onError);
      return;
    }

    try {
      audio.pause();
    } catch (err) {
      console.warn("Error pausing active audio:", err);
    }

    // Cancel any standard background web speechSynthesis process as well to prevent overlaps
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const activeVoiceURI = getActiveVoiceURI();
    let lang = "en";

    // Detect language code
    if (activeVoiceURI.startsWith("online-")) {
      const parts = activeVoiceURI.split("-");
      if (parts.length >= 2) {
        lang = parts[1]; // 'en', 'es', etc.
        if (parts.length === 3 && parts[1] === "en" && parts[2] === "gb") {
          lang = "en-gb";
        }
      }
    } else {
      const foundVoice = voices.find((v) => v.voiceURI === activeVoiceURI);
      lang = foundVoice ? foundVoice.lang.split("-")[0] : "en";
    }

    // Limit text length for a single Google Translate query to ~250 characters (extremely safe for words and phrases)
    const truncatedText = text.length > 250 ? text.slice(0, 250) + "..." : text;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(truncatedText)}`;

    // Set source and listeners dynamically
    audio.src = url;
    
    audio.onended = () => {
      audio.onended = null;
      audio.onerror = null;
      if (onEnd) onEnd();
    };
    
    audio.onerror = () => {
      audio.onended = null;
      audio.onerror = null;
      console.warn("Online Google Translate TTS played blocked or failed, fallback to system voices");
      playLocalGoogleTts(text, onEnd, onError);
    };

    audio.load();
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio.play failed:", err);
        audio.onended = null;
        audio.onerror = null;
        playLocalGoogleTts(text, onEnd, onError);
      });
    }
  };

  // Graceful offline fallback using Web Speech API Synthesis
  const trySpeakSystemTts = (text: string, onEnd?: () => void, onError?: () => void) => {
    playLocalGoogleTts(text, onEnd, onError);
  };

  // Word reader for single vocabulary elements
  const speakSingleWord = (wordText: string) => {
    playOnlineTts(wordText);
  };

  const autoReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoReading = () => {
    setIsReadingAll(false);
    isReadingAllRef.current = false;
    setAutoReadIndex(-1);
    if (autoReadTimeoutRef.current) {
      clearTimeout(autoReadTimeoutRef.current);
      autoReadTimeoutRef.current = null;
    }
    if (onlineTtsAudioRef.current) {
      try {
        onlineTtsAudioRef.current.pause();
      } catch (err) {}
      onlineTtsAudioRef.current.src = "";
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const playVocabularyAt = (index: number, vocabList: VocabularyItem[]) => {
    if (!isReadingAllRef.current) {
      return;
    }

    if (index < 0 || index >= vocabList.length) {
      stopAutoReading();
      return;
    }

    if (autoReadTimeoutRef.current) {
      clearTimeout(autoReadTimeoutRef.current);
      autoReadTimeoutRef.current = null;
    }

    setAutoReadIndex(index);
    const currentItem = vocabList[index];

    let hasTriggeredNext = false;
    const triggerNext = () => {
      if (hasTriggeredNext) return;
      hasTriggeredNext = true;

      if (!isReadingAllRef.current) return;

      autoReadTimeoutRef.current = setTimeout(() => {
        playVocabularyAt(index + 1, vocabList);
      }, 1500);
    };

    playOnlineTts(
      currentItem.word,
      triggerNext,
      triggerNext
    );
  };

  const handleToggleReadAll = () => {
    const list = selectedArticle?.vocabulary || [];
    if (list.length === 0) return;

    if (isReadingAll) {
      stopAutoReading();
    } else {
      setIsReadingAll(true);
      isReadingAllRef.current = true;
      if (onlineTtsAudioRef.current) {
        try { onlineTtsAudioRef.current.pause(); } catch (err) {}
        onlineTtsAudioRef.current.src = "";
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      playVocabularyAt(0, list);
    }
  };

  const generateTestQuestions = (
    vocabList: VocabularyItem[],
  ): TestQuestion[] => {
    if (vocabList.length === 0) return [];

    const part1: TestQuestion[] = vocabList.map((item) => {
      const otherMeanings = vocabList
        .filter((v) => v.id !== item.id)
        .map((v) => v.definition);

      const distractors = otherMeanings
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const options = [item.definition, ...distractors].sort(
        () => 0.5 - Math.random(),
      );

      return {
        vocabId: item.id,
        type: "word-to-meaning",
        prompt: item.word,
        correctAnswer: item.definition,
        options,
      };
    });

    const part2: TestQuestion[] = vocabList.map((item) => {
      const otherWords = vocabList
        .filter((v) => v.id !== item.id)
        .map((v) => v.word);

      const distractors = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const options = [item.word, ...distractors].sort(
        () => 0.5 - Math.random(),
      );

      return {
        vocabId: item.id,
        type: "meaning-to-word",
        prompt: item.definition,
        correctAnswer: item.word,
        options,
      };
    });

    return [...part1, ...part2];
  };

  const handleToggleTest = () => {
    const list = selectedArticle?.vocabulary || [];
    if (list.length === 0) return;

    if (isTesting) {
      setIsTesting(false);
      setTestQuestions([]);
      setUserAnswers({});
      setIsTestSubmitted(false);
      setTestResults(null);
    } else {
      stopAutoReading();
      setIsTesting(true);
      setTestQuestions(generateTestQuestions(list));
      setUserAnswers({});
      setIsTestSubmitted(false);
      setTestResults(null);
    }
  };

  const handleSubmitTest = () => {
    if (isTestSubmitted) return;

    let correctCount = 0;
    testQuestions.forEach((q, idx) => {
      const userAnswer = userAnswers[idx];
      if (userAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const incorrectCount = testQuestions.length - correctCount;
    const percentage = Math.round((correctCount / testQuestions.length) * 100);

    setTestResults({
      correct: correctCount,
      incorrect: incorrectCount,
      percentage,
    });
    setIsTestSubmitted(true);
  };

  const fontSizes: (
    | "text-xs"
    | "text-sm"
    | "text-base"
    | "text-lg"
    | "text-xl"
  )[] = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"];
  const vocabFontSizes = [
    "text-[11px]",
    "text-[13px]",
    "text-[15px]",
    "text-[18px]",
    "text-[22px]",
    "text-[26px]",
    "text-[32px]",
  ];

  // Dynamically load web speech synthesis voices with a robust polling fallback and multiple events for mobile/WebView
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let attempts = 0;
    const maxAttempts = 30; // 15 seconds max

    const updateVoices = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const allVoices = window.speechSynthesis.getVoices();
        
        // Android WebView and Google TTS often require polling or multiple calls
        // until the voices array gets fully resolved and populated.
        if (allVoices && allVoices.length > 0) {
          setVoices(allVoices);
          
          // Set a default voice if and only if none is currently selected
          setSelectedVoiceURI((prev) => {
            if (prev) return prev;
            // Prefer Google voices or English/Local languages to match standard TTS use
            const googleVoice = allVoices.find((v) => v.name.toLowerCase().includes("google") && v.lang.startsWith("en"));
            const enVoice = allVoices.find((v) => v.lang.startsWith("en"));
            const fallbackVoice = googleVoice || enVoice || allVoices[0];
            return fallbackVoice ? fallbackVoice.voiceURI : "";
          });

          // Since we found voices, we can clear the interval to save resources
          if (allVoices.length > 5 && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }
    };

    // 1. Initial attempt
    updateVoices();

    // 2. Event listener for standard onvoiceschanged
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
      if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      }
    }

    // 3. Polling mechanism for Android system WebView/Chrome Mobile
    intervalId = setInterval(() => {
      attempts++;
      updateVoices();
      if (attempts >= maxAttempts) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }, 500);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
        if (window.speechSynthesis.removeEventListener) {
          window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
        }
      }
    };
  }, []);

  // Autoread and quiz cleanup on screen or article selection change
  useEffect(() => {
    if (currentScreen !== "vocabulary") {
      stopAutoReading();
      setIsTesting(false);
      setTestQuestions([]);
      setUserAnswers({});
      setIsTestSubmitted(false);
      setTestResults(null);
      setIsVocabMenuOpen(false);
    }
    return () => {
      if (autoReadTimeoutRef.current) {
        clearTimeout(autoReadTimeoutRef.current);
      }
      if (onlineTtsAudioRef.current) {
        try { onlineTtsAudioRef.current.pause(); } catch (err) {}
        onlineTtsAudioRef.current.src = "";
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentScreen, selectedArticle]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setEditContent(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const applyStyleTag = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editContent;

    const selectedText = currentText.substring(start, end);
    const replacement = `${before}${selectedText || "text"}${after}`;
    const newContent =
      currentText.substring(0, start) +
      replacement +
      currentText.substring(end);

    setEditContent(newContent);

    // Re-focus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText || "text").length,
      );
    }, 0);
  };

  const applyTransTag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editContent;

    const selectedText = currentText.substring(start, end);
    const replacement = `{trans: ${selectedText || "text"}}`;
    const newContent =
      currentText.substring(0, start) +
      replacement +
      currentText.substring(end);

    setEditContent(newContent);

    // Re-focus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + 8,
        start + 8 + (selectedText || "text").length,
      );
    }, 0);
  };

  const [topicError, setTopicError] = useState<string | null>(null);

  // Helper for Date Ranges and Quick Filters in Search
  const getFormattedDateStrings = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const y_yyyy = yesterdayDate.getFullYear();
    const y_mm = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const y_dd = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterday = `${y_yyyy}-${y_mm}-${y_dd}`;

    const thisMonth = today.slice(0, 7); // "YYYY-MM"
    const thisYear = today.slice(0, 4); // "YYYY"
    return { today, yesterday, thisMonth, thisYear };
  };

  const getFilteredArticlesForSearch = () => {
    return articles.filter((article) => {
      // 1. Keyword search
      if (searchKeyword.trim() !== "") {
        const keyword = searchKeyword.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(keyword);
        const matchesContent = article.content.toLowerCase().includes(keyword);
        if (!matchesTitle && !matchesContent) {
          return false;
        }
      }

      // 2. Custom Date period selection or Quick filter buttons
      const formatted = getFormattedDateStrings();
      const createdDateOnly = article.createdAt.slice(0, 10); // "YYYY-MM-DD"

      if (searchTimeRange === "today") {
        if (!createdDateOnly.includes(formatted.today)) return false;
      } else if (searchTimeRange === "yesterday") {
        if (!createdDateOnly.includes(formatted.yesterday)) return false;
      } else if (searchTimeRange === "this_week") {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const formatDate = (d: Date) => {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };
        
        const mondayStr = formatDate(monday);
        const sundayStr = formatDate(sunday);
        if (createdDateOnly < mondayStr || createdDateOnly > sundayStr) return false;
      } else if (searchTimeRange === "this_month") {
        if (!createdDateOnly.includes(formatted.thisMonth)) return false;
      } else if (searchTimeRange === "this_year") {
        if (!createdDateOnly.includes(formatted.thisYear)) return false;
      } else if (searchTimeRange === "marked") {
        if (!article.marked) return false;
      } else if (searchStartDate || searchEndDate) {
        // Range search
        if (searchStartDate && createdDateOnly < searchStartDate) return false;
        if (searchEndDate && createdDateOnly > searchEndDate) return false;
      }

      return true;
    });
  };

  // Filter articles based on selected topic
  const filteredArticles = selectedTopic
    ? articles.filter((a) => a.topicId === selectedTopic.id)
    : [];

  // Parse subtitles when active article is loaded
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (selectedArticle && selectedArticle.type === "subtitle") {
      let parsed = subtitleParser(selectedArticle.content);
      if (
        parsed.length === 0 &&
        selectedArticle.content &&
        selectedArticle.content.trim()
      ) {
        parsed = [
          {
            index: 1,
            startTimeMs: 0,
            endTimeMs: 36000000,
            text: selectedArticle.content,
            translation: undefined,
          },
        ];
      }
      setParsedSegments(parsed);
      setPlaybackMs(0);
      setIsPlaying(false);
      setActiveSegmentIndex(-1);

      const savedUseReal = localStorage.getItem("article_use_real_tts_" + selectedArticle.id);
      if (savedUseReal !== null) {
        setUseRealTts(savedUseReal === "true");
      } else {
        setUseRealTts(false);
      }

      const savedLocalVoice = localStorage.getItem("article_local_voice_" + selectedArticle.id);
      if (savedLocalVoice !== null) {
        setSelectedLocalVoiceURI(savedLocalVoice);
      } else {
        setSelectedLocalVoiceURI("google-en-us");
      }
    } else {
      setParsedSegments([]);
    }
  }, [selectedArticle]);

  // Handle active subtitle segment highlighting
  useEffect(() => {
    if (selectedArticle?.type === "subtitle" && parsedSegments.length > 0) {
      const idx = parsedSegments.findIndex(
        (seg) => playbackMs >= seg.startTimeMs && playbackMs <= seg.endTimeMs,
      );
      if (idx !== activeSegmentIndex) {
        setActiveSegmentIndex(idx);

        // Auto scroll matching active line inside the simulated phone
        if (idx !== -1 && listContainerRef.current) {
          const activeEl = listContainerRef.current.querySelector(
            `[data-seg-index="${idx}"]`,
          );
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    }
  }, [playbackMs, parsedSegments, selectedArticle]);

  // Sync real audio controls when isPlaying state changes
  useEffect(() => {
    if (audioPlayerRef.current && selectedArticle?.audioUrl) {
      if (isPlaying) {
        audioPlayerRef.current.play().catch((err) => {
          console.warn("Audio playback not allowed or failed:", err);
        });
      } else {
        audioPlayerRef.current.pause();
      }
    }
  }, [isPlaying, selectedArticle]);

  // Sync speed / playback speed rate
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, isPlaying]);

  // Sync repeat setting
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.loop = isRepeatEnabled;
    }
  }, [isRepeatEnabled]);

  // Audio simulation timer or Real audio position listener
  useEffect(() => {
    if (isPlaying) {
      if (useRealTts) {
        return;
      }
      const intervalMs = 50; // update speed

      if (selectedArticle?.audioUrl && audioPlayerRef.current) {
        // Real Audio tracking interval
        timerRef.current = setInterval(() => {
          if (audioPlayerRef.current) {
            setPlaybackMs(
              Math.round(audioPlayerRef.current.currentTime * 1000),
            );
          }
        }, intervalMs);
      } else {
        // Fallback simulation timer
        const totalDuration =
          parsedSegments.length > 0
            ? parsedSegments[parsedSegments.length - 1].endTimeMs + 1000
            : 30000; // default 30s fallback

        timerRef.current = setInterval(() => {
          setPlaybackMs((prev) => {
            const nextVal = prev + intervalMs * playbackSpeed;
            if (nextVal >= totalDuration) {
              if (isRepeatEnabled) {
                return 0;
              } else {
                setIsPlaying(false);
                return 0;
              }
            }
            return nextVal;
          });
        }, intervalMs);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isPlaying,
    playbackSpeed,
    parsedSegments,
    isRepeatEnabled,
    selectedArticle,
  ]);

  // Segment-by-segment Text-to-Speech playback loop
  const playTtsSegment = (index: number) => {
    if (!selectedArticle || index < 0 || index >= parsedSegments.length) {
      setIsPlaying(false);
      setActiveSegmentIndex(-1);
      return;
    }

    setActiveSegmentIndex(index);
    
    // Scroll active element into view
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(
        `[data-seg-index="${index}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    const segment = parsedSegments[index];
    playOnlineTts(
      segment.text,
      () => {
        if (index + 1 < parsedSegments.length) {
          autoReadTimeoutRef.current = setTimeout(() => {
            playTtsSegment(index + 1);
          }, 400); // Natural pause between sentences
        } else {
          setIsPlaying(false);
          setActiveSegmentIndex(-1);
        }
      },
      () => {
        if (index + 1 < parsedSegments.length) {
          playTtsSegment(index + 1);
        } else {
          setIsPlaying(false);
          setActiveSegmentIndex(-1);
        }
      }
    );
  };

  // Speaks using the Web/Online Speech synthesis or Google Translate API
  const handleTtsSpeak = () => {
    if (!selectedArticle) return;

    if (isPlaying) {
      // Pause playback
      setIsPlaying(false);
      if (onlineTtsAudioRef.current) {
        try { onlineTtsAudioRef.current.pause(); } catch (err) {}
      }
      if (autoReadTimeoutRef.current) {
        clearTimeout(autoReadTimeoutRef.current);
        autoReadTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Play playback
    setIsPlaying(true);
    
    // Resume from the active subtitle segment position, or wrap back to 0 if at the end
    const startIndex = (activeSegmentIndex >= 0 && activeSegmentIndex < parsedSegments.length) 
      ? activeSegmentIndex 
      : 0;

    playTtsSegment(startIndex);
  };

  const handleSaveToPlainText = () => {
    if (!selectedArticle) return;
    const content = parsedSegments.map((s) => s.text).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedArticle.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const seekTo = (ms: number) => {
    setPlaybackMs(ms);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = ms / 1000;
    }
  };

  const togglePlay = () => {
    if (useRealTts) {
      handleTtsSpeak();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const selectTopicAction = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentScreen("articles");
  };

  const selectArticleAction = (article: Article) => {
    setSelectedArticle(article);
    if (currentScreen === "search-articles") {
      setCameFromSearch(true);
    } else {
      setCameFromSearch(false);
    }
    setCurrentScreen("article-detail");
    onOpenArticle(article.id);
    setIsInsertExpressionExpanded(false);
  };

  const goBack = () => {
    setIsMenuOpen(false);
    setIsTopicsMenuOpen(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (currentScreen === "article-detail") {
      if (cameFromSearch || !selectedTopic) {
        setCurrentScreen("search-articles");
      } else {
        setCurrentScreen("articles");
      }
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    } else if (currentScreen === "articles") {
      setCurrentScreen("topics");
      setSelectedTopic(null);
    } else if (currentScreen === "edit-article") {
      setCurrentScreen(isEditingNew ? ((cameFromSearch || !selectedTopic) ? "search-articles" : "articles") : "article-detail");
    } else if (currentScreen === "vocabulary") {
      setCurrentScreen("article-detail");
    } else if (currentScreen === "topic-management" || currentScreen === "settings") {
      setCurrentScreen("topics");
    } else if (currentScreen === "search-articles") {
      setCurrentScreen("topics");
    } else if (currentScreen === "topics") {
      setShowExitDialog(true);
    }
  };

  // Human timestamp utility
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-slate-50 text-slate-850 flex flex-col relative overflow-hidden select-text">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-between py-12 px-6"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-44 h-44 md:w-48 md:h-48 bg-slate-50 rounded-full flex items-center justify-center p-2 shadow-sm border border-slate-100/50"
              >
                <img
                  src={splashImage}
                  alt="Rabbit hugging a carrot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-full"
                />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 text-2xl font-extrabold text-slate-800 tracking-tight text-center font-sans"
              >
                VYN LingoBunny
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-2 text-sm text-slate-400 text-center font-medium max-w-xs font-sans"
              >
                Your adorable vocabulary companion
              </motion.p>
            </div>

            {/* Bottom loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center space-y-2.5 pb-4"
            >
              <div className="flex space-x-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase font-mono">
                Initializing language deck...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden React audio playback synchronizer */}
      <audio
        ref={audioPlayerRef}
        src={selectedArticle?.audioUrl || undefined}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (!isRepeatEnabled) {
            setIsPlaying(false);
            setPlaybackMs(0);
          }
        }}
      />

      {/* Dedicated DOM-mounted audio element for online TTS playing to bypass mobile browser restrictions */}
      <audio
        ref={onlineTtsAudioRef}
        preload="auto"
        className="hidden"
      />
                {/* Header Layout (TopAppBar) */}
                <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-xs relative z-40">
                  <div className="flex items-center space-x-2">
                    {currentScreen === "topics" && (
                      <div className="relative">
                        <button
                          onClick={() => setIsTopicsMenuOpen(!isTopicsMenuOpen)}
                          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-650 transition-colors cursor-pointer"
                          title="Menu options"
                        >
                          <Menu className="w-5 h-5 animate-pulse" />
                        </button>

                        {isTopicsMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsTopicsMenuOpen(false)}
                            />
                            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Actions
                              </div>
                              <button
                                onClick={() => {
                                  setIsTopicsMenuOpen(false);
                                  setTopicManageMode("list");
                                  setCurrentScreen("topic-management");
                                }}
                                className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-650 transition-colors flex items-center space-x-2 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Topic Management</span>
                              </button>

                              <div className="border-t border-slate-100 my-1.5" />

                              <button
                                onClick={() => {
                                  setIsTopicsMenuOpen(false);
                                  setCurrentScreen("settings");
                                }}
                                className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-650 transition-colors flex items-center space-x-2 cursor-pointer"
                              >
                                <Settings className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Settings</span>
                              </button>

                              <div className="border-t border-slate-100 my-1.5" />

                              <button
                                onClick={() => {
                                  setIsTopicsMenuOpen(false);
                                  setShowIntroDialog(true);
                                }}
                                className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-650 transition-colors flex items-center space-x-2 cursor-pointer"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Introduction</span>
                              </button>

                              <button
                                onClick={() => {
                                  setIsTopicsMenuOpen(false);
                                  setShowExitDialog(true);
                                }}
                                className="w-full text-left px-4 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 hover:text-red-750 transition-colors flex items-center space-x-2 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5 text-red-500" />
                                <span>Exit</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {currentScreen !== "topics" && (
                      <button
                        onClick={goBack}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-650 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <span
                      className={`font-bold text-[14px] leading-[20px] align-middle ${
                        currentScreen === "article-detail"
                          ? "text-[#204A87] py-0.5 max-w-[215px] truncate block"
                          : "text-[#1b1b1b] tracking-tight truncate max-w-[170px] inline-block"
                      }`}
                      title={selectedArticle?.title}
                    >
                      {currentScreen === "topics" && "My Topics"}
                      {currentScreen === "topic-management" &&
                        "Topic Management"}
                      {currentScreen === "settings" && "Settings"}
                      {currentScreen === "search-articles" && "Search Articles"}
                      {currentScreen === "articles" &&
                        (selectedTopic?.title || "Articles")}
                      {currentScreen === "article-detail" &&
                        (selectedArticle?.title || "Reader")}
                      {currentScreen === "edit-article" &&
                        (isEditingNew ? "Create New Article" : "Edit Article")}
                      {currentScreen === "vocabulary" && (
                        <span className="inline-flex items-center gap-1.5" style={{ color: "#049263" }}>
                          <span style={{ color: "#049263" }}>Vocabulary</span>
                          <BookOpen className="w-4 h-4 shrink-0" style={{ color: "#049263" }} />
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Topics Screen Search Button */}
                  {currentScreen === "topics" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchKeyword("");
                        setSearchTimeRange("all");
                        setSearchStartDate("");
                        setSearchEndDate("");
                        setCurrentScreen("search-articles");
                      }}
                      className="p-1.5 hover:bg-slate-100 text-slate-650 rounded-full transition-colors cursor-pointer mr-0.5"
                      title="Search articles"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}

                  {/* Interactive badge & Extra Commands Dropdown menu */}
                  {currentScreen === "articles" && (
                    <button
                      onClick={() => {
                        setEditTitle("");
                        setEditType("subtitle");
                        setEditContent(
                          `1\n00:00:01,000 --> 00:00:04,500\nHello and welcome!\n\n2\n00:00:05,000 --> 00:00:09,000\nThis is a newly created article.`,
                        );
                        setEditImageUrl(ARTICLE_IMAGES[0]);
                        setEditAudioUrl("");
                        setIsEditingNew(true);
                        setEditorFontSize(13);
                        setCurrentScreen("edit-article");
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-700 text-indigo-600 rounded-md border border-indigo-200/45 transition-colors cursor-pointer mr-1"
                      title="Create new article in this topic"
                    >
                      <Plus className="w-5 h-5 shrink-0" />
                    </button>
                  )}

                  {currentScreen === "article-detail" && selectedArticle && (
                    <div className="relative flex items-center">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 hover:bg-slate-100 text-slate-650 rounded-full transition-colors cursor-pointer"
                        title="Article options (Zoom, Save, TTS Voice)"
                      >
                        <MoreVertical className="w-5 h-5 shrink-0" />
                      </button>

                      {isMenuOpen && (
                        <>
                          {/* Invisible backdrop to dismiss dropdown on click outside */}
                          <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setIsMenuOpen(false)}
                          />

                          {/* Main floating popover menu */}
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-100">
                            {/* Group 0: Manage Article */}
                            <div className="space-y-1.5">
                              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                                ARTICLE ACTION
                              </span>
                              <button
                                onClick={() => {
                                  setEditTitle(selectedArticle.title);
                                  setEditType(selectedArticle.type);
                                  setEditContent(selectedArticle.content);
                                  setEditImageUrl(
                                    selectedArticle.imageUrl ||
                                      ARTICLE_IMAGES[
                                        selectedArticle.id %
                                          ARTICLE_IMAGES.length
                                      ],
                                  );
                                  setEditAudioUrl(
                                    selectedArticle.audioUrl || "",
                                  );
                                  setIsEditingNew(false);
                                  setEditorFontSize(13);
                                  setCurrentScreen("edit-article");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-3xs hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <Edit className="w-3 h-3" />
                                <span>EDIT THIS ARTICLE</span>
                              </button>

                              <button
                                onClick={() => {
                                  setCurrentScreen("vocabulary");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-3xs hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Vocabulary</span>
                              </button>

                              <button
                                id="toggle-translation-btn"
                                onClick={() => {
                                  setShowTranslation(!showTranslation);
                                  setIsMenuOpen(false);
                                }}
                                style={{ color: "#fefeff", backgroundColor: "#b73f9b" }}
                                className={`w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                                  showTranslation
                                    ? "border-pink-300 hover:opacity-90"
                                    : "border-pink-200 hover:opacity-90"
                                }`}
                              >
                                <Eye className="w-3 h-3" />
                                <span>
                                  {showTranslation
                                    ? "Hide Translation"
                                    : "Show Translation"}
                                </span>
                              </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-150" />

                            {/* Group 1: Subtitle font zoom */}
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                                Text Sizing
                              </span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-lg p-1">
                                <button
                                  onClick={() => {
                                    const currentIdx =
                                      fontSizes.indexOf(fontSizeClass);
                                    if (currentIdx > 0) {
                                      setFontSizeClass(
                                        fontSizes[currentIdx - 1],
                                      );
                                    }
                                  }}
                                  disabled={fontSizeClass === "text-xs"}
                                  className="p-1 px-2.5 bg-white hover:bg-slate-100 disabled:opacity-40 rounded border border-slate-150 text-slate-700 transition-colors flex items-center justify-center grow cursor-pointer font-bold text-[10px]"
                                  title="Zoom Out font size"
                                >
                                  <ZoomOut className="w-3 h-3 mr-1" />
                                  <span>A-</span>
                                </button>

                                <span className="text-[10px] font-mono font-bold text-slate-650 px-1 shrink-0 capitalize text-center min-w-[55px]">
                                  {fontSizeClass.replace("text-", "")}
                                </span>

                                <button
                                  onClick={() => {
                                    const currentIdx =
                                      fontSizes.indexOf(fontSizeClass);
                                    if (currentIdx < fontSizes.length - 1) {
                                      setFontSizeClass(
                                        fontSizes[currentIdx + 1],
                                      );
                                    }
                                  }}
                                  disabled={fontSizeClass === "text-xl"}
                                  className="p-1 px-2.5 bg-white hover:bg-slate-100 disabled:opacity-40 rounded border border-slate-150 text-slate-700 transition-colors flex items-center justify-center grow cursor-pointer font-bold text-[10px]"
                                  title="Zoom In font size"
                                >
                                  <ZoomIn className="w-3 h-3 mr-1" />
                                  <span>A+</span>
                                </button>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-150" />

                            {/* Group 2: Save to plain text */}
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                                Export File
                              </span>
                              <button
                                onClick={() => {
                                  handleSaveToPlainText();
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                <FileDown className="w-3 h-3" />
                                <span>Save Plain Text</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {currentScreen === "vocabulary" && selectedArticle && (
                    <div className="relative flex items-center">
                      <button
                        onClick={() => setIsVocabMenuOpen(!isVocabMenuOpen)}
                        className="p-1.5 hover:bg-slate-100 text-slate-650 rounded-full transition-colors cursor-pointer mr-1"
                        title="Vocabulary text size options"
                      >
                        <MoreVertical className="w-5 h-5 shrink-0" />
                      </button>

                      {isVocabMenuOpen && (
                        <>
                          {/* Invisible backdrop to dismiss dropdown on click outside */}
                          <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setIsVocabMenuOpen(false)}
                          />

                          {/* Floating popover menu */}
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-100">
                            {/* Group 1: Vocab font size zoom */}
                            <div className="text-left">
                              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1 font-sans">
                                Vocab Text Zoom
                              </span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-lg p-1">
                                <button
                                  id="btn-vocab-zoom-out"
                                  onClick={() => {
                                    const currentIdx =
                                      vocabFontSizes.indexOf(vocabFontSize);
                                    if (currentIdx > 0) {
                                      setVocabFontSize(
                                        vocabFontSizes[currentIdx - 1],
                                      );
                                    }
                                  }}
                                  disabled={vocabFontSize === vocabFontSizes[0]}
                                  className="p-1 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 rounded border border-slate-150 text-slate-700 transition-colors flex items-center justify-center grow cursor-pointer font-bold text-[10px]"
                                  title="Zoom Out vocab text"
                                >
                                  <ZoomOut className="w-3 h-3 mr-1" />
                                  <span>A-</span>
                                </button>

                                <span className="text-[10px] font-mono font-bold text-slate-650 px-1 shrink-0 capitalize text-center min-w-[55px]">
                                  {vocabFontSize
                                    .replace("text-[", "")
                                    .replace("]", "")}
                                </span>

                                <button
                                  id="btn-vocab-zoom-in"
                                  onClick={() => {
                                    const currentIdx =
                                      vocabFontSizes.indexOf(vocabFontSize);
                                    if (
                                      currentIdx <
                                      vocabFontSizes.length - 1
                                    ) {
                                      setVocabFontSize(
                                        vocabFontSizes[currentIdx + 1],
                                      );
                                    }
                                  }}
                                  disabled={
                                    vocabFontSize ===
                                    vocabFontSizes[vocabFontSizes.length - 1]
                                  }
                                  className="p-1 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 rounded border border-slate-150 text-slate-700 transition-colors flex items-center justify-center grow cursor-pointer font-bold text-[10px]"
                                  title="Zoom In vocab text"
                                >
                                  <ZoomIn className="w-3 h-3 mr-1" />
                                  <span>A+</span>
                                </button>
                              </div>
                            </div>

                            {/* Google TTS mode Group */}
                            <div className="text-left pt-1.5 border-t border-slate-100 space-y-2">
                              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1 font-sans">
                                Google TTS Mode
                              </span>
                              <div className="space-y-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                <button
                                  id="btn-init-tts-service"
                                  type="button"
                                  onClick={() => {
                                    setIsInitializingLocalTts(true);
                                    
                                    // Wake up speechSynthesis instantly
                                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                      try {
                                        window.speechSynthesis.cancel();
                                        const systemVoicesObj = window.speechSynthesis.getVoices();
                                        if (systemVoicesObj && systemVoicesObj.length > 0) {
                                          setVoices(systemVoicesObj);
                                        }
                                        
                                        // Silent speak to initialize WebView/OS sound streams
                                        const tinyWake = new SpeechSynthesisUtterance(" ");
                                        tinyWake.volume = 0;
                                        window.speechSynthesis.speak(tinyWake);
                                      } catch (err) {
                                        console.warn("Speech synthesis initial wakeup failed:", err);
                                      }
                                    }

                                    setTimeout(() => {
                                      setIsInitializingLocalTts(false);
                                      setIsLocalTtsActive(true);
                                      localStorage.setItem("local_tts_initialized", "true");
                                      
                                      // Final robust check for standard speech voices list
                                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                        const currentVoices = window.speechSynthesis.getVoices();
                                        if (currentVoices && currentVoices.length > 0) {
                                          setVoices(currentVoices);
                                          
                                          // Pick standard default local voice if unselected
                                          const matchingGoogleEn = currentVoices.find((v) => 
                                            v.name.toLowerCase().includes("google") && v.lang.startsWith("en")
                                          );
                                          const fallbackURI = matchingGoogleEn ? matchingGoogleEn.voiceURI : (currentVoices[0] ? currentVoices[0].voiceURI : "google-en-us");
                                          
                                          const activeVoice = getActiveLocalVoiceURI();
                                          if (activeVoice === "google-en-us" && fallbackURI !== "google-en-us") {
                                            handleLocalVoiceChange(fallbackURI);
                                          }
                                        }
                                      }
                                    }, 850);
                                  }}
                                  disabled={isInitializingLocalTts}
                                  className="w-full flex items-center justify-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-1 rounded px-2 text-[10px] font-bold uppercase transition-all cursor-pointer shadow-3xs"
                                >
                                  {isInitializingLocalTts ? (
                                    <span className="flex items-center space-x-1 animate-pulse text-[9.5px] text-amber-600 font-extrabold uppercase">
                                      Connecting...
                                    </span>
                                  ) : isLocalTtsActive ? (
                                    <span className="text-emerald-600 font-extrabold flex items-center">
                                      ✓ Init TTS Service
                                    </span>
                                  ) : (
                                    <span>Init TTS Service</span>
                                  )}
                                </button>

                                <div className="space-y-0.5">
                                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest text-left">
                                    Language
                                  </span>
                                  <select
                                    id="combo-local-tts-lang"
                                    value={getActiveLocalVoiceURI()}
                                    onChange={(e) => handleLocalVoiceChange(e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[9px] font-semibold text-slate-800 outline-none cursor-pointer"
                                  >
                                    {!isLocalTtsActive ? (
                                      <option value="">Not Initialized</option>
                                    ) : (
                                      getAvailableLocalVoices().map((voice, idx) => (
                                        <option key={voice.voiceURI || idx} value={voice.voiceURI}>
                                          {voice.name || voice.lang || `Voice ${idx + 1}`}
                                        </option>
                                      ))
                                    )}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Group 2: Audio Mode / TTS mode */}
                            <div className="text-left pt-1.5 border-t border-slate-100 space-y-2">
                              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1 font-sans">
                                TTS Mode
                              </span>
                              <div className="flex flex-col space-y-1.5">
                                <label className="flex items-center space-x-2 bg-slate-50 border border-slate-150 p-2 rounded-lg cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={useRealTts}
                                    onChange={(e) => {
                                      setUseRealTts(e.target.checked);
                                      setIsPlaying(false);
                                      if (onlineTtsAudioRef.current) {
                                        try { onlineTtsAudioRef.current.pause(); } catch (err) {}
                                        onlineTtsAudioRef.current.src = "";
                                      }
                                      if (audioPlayerRef.current) {
                                        audioPlayerRef.current.pause();
                                      }
                                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                        window.speechSynthesis.cancel();
                                      }
                                    }}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span className="text-[9px] font-bold text-slate-705 uppercase tracking-tight">Use Internet Text-To-Speech</span>
                                </label>

                                {useRealTts && (
                                  <div className="space-y-1">
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide text-left">
                                      Speech Voice Accent
                                    </span>
                                    <select
                                      value={getActiveVoiceURI()}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (selectedArticle) {
                                          localStorage.setItem("article_voice_" + selectedArticle.id, val);
                                        }
                                        setSelectedVoiceURI(val);
                                      }}
                                      className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2 py-1 text-[9.5px] font-semibold text-slate-800 outline-none cursor-pointer font-sans"
                                    >
                                      <option value="online-en">Online English Voice (US)</option>
                                      <option value="online-en-gb">Online English Voice (UK)</option>
                                      <option value="online-es">Online Spanish Voice (ES)</option>
                                      <option value="online-fr">Online French Voice (FR)</option>
                                      <option value="online-ja">Online Japanese Voice (JP)</option>
                                      <option value="online-zh">Online Chinese Voice (CN)</option>
                                      <option value="online-vi">Online Vietnamese Voice (VN)</option>
                                      <option value="online-ko">Online Korean Voice (KR)</option>
                                      {voices.length > 0 && (
                                        <optgroup label="System Voices">
                                          {voices.map((voice) => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                              {voice.name} ({voice.lang})
                                            </option>
                                          ))}
                                        </optgroup>
                                      )}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* SCREEN CONTENT AREA */}
                <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                  {/* Google Drive / VDB Sync Status Overlay */}
                  {syncStatus.isSyncing && (
                    <div className="absolute inset-x-0 inset-y-0 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-50">
                      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-xs w-full space-y-4 border border-slate-100 flex flex-col items-center">
                        <div className="relative flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-4 border-indigo-150 border-t-indigo-600 animate-spin" />
                          <Cloud className="w-5 h-5 text-indigo-600 absolute" />
                        </div>
                        <div className="space-y-1.5 w-full">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                            {syncStatus.direction === 'upload' ? 'Upload to Drive' : 'Download from Drive'}
                          </h4>
                          <p className="text-[10.5px] text-slate-500 font-semibold leading-normal break-words">
                            {syncStatus.message}
                          </p>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden font-mono">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${syncStatus.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {vdbStatus.type && (
                    <div className="absolute inset-x-4 top-4 bg-slate-950/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-lg border border-white/10 z-50 flex items-center space-x-2">
                      {vdbStatus.type === 'loading' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin shrink-0" />
                      ) : vdbStatus.type === 'success' ? (
                        <Check className="w-4 h-4 text-emerald-450 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-450 shrink-0" />
                      )}
                      <span className="text-[10px] font-bold tracking-wide flex-1 leading-tight">
                        {vdbStatus.message}
                      </span>
                    </div>
                  )}

                  {/* SCREEN 1: Topics List */}
                  {currentScreen === "topics" && (
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl mb-2">
                        <p className="text-indigo-800 text-[11px] leading-relaxed flex items-center space-x-1 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            Select a workspace learning topic to explore:
                          </span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        {topics.map((topic) => (
                          <div
                            key={topic.id}
                            id={`topic-item-${topic.id}`}
                            onClick={() => selectTopicAction(topic)}
                            className="bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-xl cursor-pointer shadow-xs transition-all duration-200 active:scale-[0.98] group"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {topic.title}
                              </h4>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            </div>
                            <p className="text-slate-500 text-xs line-clamp-2">
                              {topic.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOPIC MANAGEMENT SCREEN */}
                  {currentScreen === "topic-management" && (
                    <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {topicManageMode === "list"
                            ? "All Topics"
                            : topicManageMode === "add"
                              ? "Add New Topic"
                              : "Edit Topic"}
                        </h4>
                        {topicManageMode === "list" ? (
                          <button
                            onClick={() => {
                              setTopicAddTitle("");
                              setTopicAddDesc("");
                              setTopicManageMode("add");
                              setTopicError(null);
                            }}
                            className="flex items-center space-x-1 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2.5 rounded-lg shadow-xs uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Topic</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setTopicManageMode("list");
                              setTopicError(null);
                            }}
                            className="text-xs text-slate-505 hover:text-slate-805 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {topicError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex justify-between items-center animate-in fade-in slide-in-from-top-1 duration-150">
                          <span>{topicError}</span>
                          <button
                            type="button"
                            onClick={() => setTopicError(null)}
                            className="text-red-500 hover:text-red-700 font-extrabold text-[10px] uppercase ml-2 select-none cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      {topicManageMode === "list" && (
                        <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                          {topics.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-12">
                              No topics found. Add one to start.
                            </p>
                          ) : (
                            topics.map((topic) => {
                              const hasArticles = articles.some(
                                (art) => art.topicId === topic.id,
                              );
                              const articleCount = articles.filter(
                                (art) => art.topicId === topic.id,
                              ).length;
                              return (
                                <div
                                  key={topic.id}
                                  className="bg-white border border-slate-200 p-3 rounded-xl flex items-start justify-between shadow-2xs"
                                >
                                  <div className="flex-1 min-w-0 pr-2">
                                    <h5 className="text-xs font-bold text-slate-800 truncate">
                                      {topic.title}
                                    </h5>
                                    <p className="text-slate-500 text-[11px] line-clamp-1 mb-1">
                                      {topic.description}
                                    </p>
                                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                                      {articleCount}{" "}
                                      {articleCount === 1
                                        ? "article"
                                        : "articles"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTopicToEdit(topic);
                                        setTopicAddTitle(topic.title);
                                        setTopicAddDesc(topic.description);
                                        setTopicManageMode("edit");
                                        setTopicError(null);
                                      }}
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Topic"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (hasArticles) {
                                          setTopicError(
                                            `"${topic.title}" contains ${articleCount} articles and cannot be deleted.`,
                                          );
                                        } else if (onDeleteTopic) {
                                          onDeleteTopic(topic.id);
                                        }
                                      }}
                                      disabled={hasArticles}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        hasArticles
                                          ? "text-slate-200 cursor-not-allowed"
                                          : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                                      }`}
                                      title={
                                        hasArticles
                                          ? "Cannot delete: topic contains articles"
                                          : "Delete Topic"
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {(topicManageMode === "add" ||
                        topicManageMode === "edit") && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!topicAddTitle.trim()) {
                              setTopicError("Title is required.");
                              return;
                            }
                            if (topicManageMode === "add" && onAddTopic) {
                              onAddTopic(
                                topicAddTitle.trim(),
                                topicAddDesc.trim(),
                              );
                            } else if (
                              topicManageMode === "edit" &&
                              selectedTopicToEdit &&
                              onUpdateTopic
                            ) {
                              onUpdateTopic(
                                selectedTopicToEdit.id,
                                topicAddTitle.trim(),
                                topicAddDesc.trim(),
                              );
                            }
                            setTopicManageMode("list");
                            setTopicError(null);
                          }}
                          className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-3 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Topic Title
                            </label>
                            <input
                              type="text"
                              required
                              value={topicAddTitle}
                              onChange={(e) => setTopicAddTitle(e.target.value)}
                              placeholder="e.g. Daily Phrases"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Description
                            </label>
                            <textarea
                              value={topicAddDesc}
                              onChange={(e) => setTopicAddDesc(e.target.value)}
                              placeholder="Topic context and learning objectives..."
                              rows={3}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            {topicManageMode === "add"
                              ? "Create Topic"
                              : "Save Changes"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* ARTICLE SEARCH SCREEN */}
                  {currentScreen === "search-articles" && (
                    <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0">
                      {/* Keyword Search Input */}
                      <div className="relative shrink-0">
                        <input
                          type="text"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="Search articles by keyword..."
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 focus:ring-1 focus:ring-indigo-505 focus:outline-hidden shadow-2xs"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        {searchKeyword && (
                          <button
                            type="button"
                            onClick={() => setSearchKeyword("")}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 absolute right-2 top-2 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Time Period Filter Area */}
                      <div className="space-y-2 bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs shrink-0">
                        <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                          FILTER ARTICLE
                        </span>

                        {/* Quick Filters Grid */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: "all", label: "All" },
                            { id: "today", label: "Today" },
                            { id: "yesterday", label: "Yesterday" },
                            { id: "this_week", label: "This Week" },
                            { id: "this_month", label: "This Month" },
                            { id: "this_year", label: "This Year" },
                            { id: "marked", label: "Marked" },
                          ].map((btn) => (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() => {
                                      setSearchTimeRange(btn.id as any);
                                if (btn.id !== "all") {
                                  setSearchStartDate("");
                                  setSearchEndDate("");
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                                searchTimeRange === btn.id
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100"
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom Range Selector */}
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <CustomDatePicker
                            label="Start Date"
                            value={searchStartDate}
                            onChange={(val) => {
                              setSearchStartDate(val);
                              setSearchTimeRange("all"); // overrides quick filter
                            }}
                          />
                          <CustomDatePicker
                            label="End Date"
                            value={searchEndDate}
                            onChange={(val) => {
                              setSearchEndDate(val);
                              setSearchTimeRange("all"); // overrides quick filter
                            }}
                            align="right"
                          />
                        </div>
                      </div>

                      {/* Results Header */}
                      <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-wider px-1 font-bold shrink-0">
                        <span>Results</span>
                        <span>
                          {getFilteredArticlesForSearch().length} matched
                        </span>
                      </div>

                      {/* Results list */}
                      <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
                        {getFilteredArticlesForSearch().length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                            No matching articles found.
                          </div>
                        ) : (
                          getFilteredArticlesForSearch().map((article) => {
                            const artTopic = topics.find(
                              (t) => t.id === article.topicId,
                            );
                            return (
                              <div
                                key={article.id}
                                onClick={() => selectArticleAction(article)}
                                className="bg-white border border-slate-200 hover:border-indigo-400 p-2.5 rounded-xl cursor-pointer shadow-2xs transition-all duration-150 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                  <img
                                    src={
                                      article.imageUrl ||
                                      ARTICLE_IMAGES[
                                        article.id % ARTICLE_IMAGES.length
                                      ]
                                    }
                                    alt={article.title}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-sm font-bold text-indigo-700 truncate">
                                      {article.title}
                                    </h5>
                                    <div className="flex items-center space-x-1.5 mt-0.5">
                                      {artTopic && (
                                        <span className="text-[9px] text-indigo-650 bg-indigo-50/50 px-1 py-0.2 rounded font-semibold truncate max-w-[80px]">
                                          {artTopic.title}
                                        </span>
                                      )}
                                      <span className="text-[9px] text-slate-400 font-medium">
                                        {article.createdAt.slice(0, 10)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onToggleMarkArticle) {
                                        onToggleMarkArticle(article.id);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                    title="Toggle Mark"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        article.marked
                                          ? "text-yellow-500 fill-yellow-400"
                                          : "text-slate-300 fill-white"
                                      }`}
                                    />
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: Articles List */}
                  {currentScreen === "articles" && (
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="space-y-2">
                        {filteredArticles.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs">
                            No articles in this topic. Connect a database schema
                            or initialize default.
                          </div>
                        ) : (
                          filteredArticles.map((article) => (
                            <div
                              key={article.id}
                              id={`article-item-${article.id}`}
                              onClick={() => selectArticleAction(article)}
                              className="bg-white border border-slate-200 hover:border-indigo-400 p-3 rounded-xl cursor-pointer shadow-xs transition-all duration-200 active:scale-[0.98] flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                                <img
                                  src={
                                    article.imageUrl ||
                                    ARTICLE_IMAGES[
                                      article.id % ARTICLE_IMAGES.length
                                    ]
                                  }
                                  alt={article.title}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-200/80 shadow-2xs shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-bold text-indigo-700 line-clamp-2 leading-tight mb-1">
                                    {article.title}
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      id={`mark-btn-${article.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggleMarkArticle) {
                                          onToggleMarkArticle(article.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                      title={
                                        article.marked
                                          ? "Unmark Article"
                                          : "Mark Article"
                                      }
                                    >
                                      <Star
                                        className={`w-4 h-4 transition-transform duration-205 active:scale-125 ${
                                          article.marked
                                            ? "text-yellow-500 fill-yellow-400 font-extrabold"
                                            : "text-slate-400 fill-white"
                                        }`}
                                      />
                                    </button>
                                    <span className="text-[10px] text-slate-400 flex items-center space-x-0.5 font-medium">
                                      <Eye className="w-3 h-3" />
                                      <span>{article.openCount} views</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* SCREEN 3: Jetpack Compose Detail Player */}
                    {currentScreen === "article-detail" && selectedArticle && (
                      <motion.div
                        key="article-detail"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col h-full bg-slate-50 select-none"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                      >
                        {/* Article main view scroll holder */}
                        <div
                          ref={listContainerRef}
                          className="flex-1 px-2 py-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-200"
                        >
                        {/* Article Cover Hero Graphic */}
                        <div className="px-1 mb-2.5">
                          <img
                            src={
                              selectedArticle.imageUrl ||
                              ARTICLE_IMAGES[
                                selectedArticle.id % ARTICLE_IMAGES.length
                              ]
                            }
                            alt="Article Cover"
                            referrerPolicy="no-referrer"
                            className="w-full h-36 object-cover rounded-2xl shadow-sm border border-slate-200/80 saturate-110"
                          />
                        </div>

                        {/* SRT segments display list */}
                        <div className="space-y-1.5 font-sans">
                          {parsedSegments.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-12">
                              Parsing SRT subtitle lines...
                            </p>
                          ) : (
                            parsedSegments.map((seg, idx) => {
                              const isCurrent = idx === activeSegmentIndex;
                              return (
                                <div
                                  key={seg.index}
                                  data-seg-index={idx}
                                  onClick={() => {
                                    seekTo(seg.startTimeMs);
                                    setActiveSegmentIndex(idx);
                                  }}
                                  className={`border rounded-xl p-3 px-4 transition-all duration-200 cursor-pointer ${
                                    isCurrent
                                      ? "bg-indigo-50/40 border-l-4 border-l-indigo-600 border-indigo-200 text-indigo-950 shadow-xs"
                                      : "bg-white border-slate-200 text-slate-650 hover:border-slate-300 hover:text-slate-800 shadow-2xs"
                                  }`}
                                >
                                  <p
                                    className={`${fontSizeClass} leading-relaxed font-article ${isCurrent ? "font-semibold text-indigo-950" : "text-slate-700"}`}
                                    dangerouslySetInnerHTML={{
                                      __html: seg.text,
                                    }}
                                  />

                                  {/* Translation Pane (displays translation text underneath in smaller gray font size) */}
                                  {seg.translation && showTranslation && (
                                    <div className="mt-2 pt-1.5 border-t border-slate-100 animate-in fade-in duration-200">
                                      <p
                                        className={`${
                                          fontSizeClass === "text-xs"
                                            ? "text-xs"
                                            : fontSizeClass === "text-sm"
                                              ? "text-[13px]"
                                              : fontSizeClass === "text-base"
                                                ? "text-[15px]"
                                                : fontSizeClass === "text-lg"
                                                  ? "text-base"
                                                  : "text-[19px]"
                                        } text-slate-500 font-medium italic select-all leading-normal`}
                                      >
                                        {seg.translation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* BOTTOM JETPACK COMPOSE MEDIA CONTROLLER SECTION */}
                      <div className="border-t border-slate-200 bg-white px-4 py-3 pb-4 space-y-2 shadow-xs">
                        {/* Timeline Slider */}
                        <input
                          type="range"
                          min={0}
                          max={
                            parsedSegments.length > 0
                              ? parsedSegments[parsedSegments.length - 1]
                                  .endTimeMs + 1000
                              : 30000
                          }
                          value={playbackMs}
                          onChange={(e) => seekTo(Number(e.target.value))}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650 focus:outline-none"
                        />

                        {/* Controls Row */}
                        <div className="flex items-center justify-between gap-2 pt-1.5">
                          {/* Left: Empty spacer to balance the centered group */}
                          <div className="w-14 shrink-0" />

                          {/* Center: Controls aligned by Play/Pause */}
                          <div className="flex items-center justify-center gap-3 flex-1">
                            {/* Repeat Button */}
                            <button
                              onClick={() => setIsRepeatEnabled(!isRepeatEnabled)}
                              className={`flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-lg transition-all cursor-pointer shrink-0 ${
                                isRepeatEnabled
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                              }`}
                              title={
                                isRepeatEnabled
                                  ? "Repeat mode: Enabled"
                                  : "Repeat mode: Disabled"
                              }
                            >
                              <RotateCcw
                                className={`w-3 h-3 ${isRepeatEnabled ? "text-white" : "text-slate-500"}`}
                              />
                              <span>REPEAT</span>
                            </button>

                            {/* Play/Pause Button */}
                            <button
                              onClick={togglePlay}
                              className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-150 hover:bg-indigo-500 hover:scale-[1.05] transition-all shrink-0 cursor-pointer"
                            >
                              {isPlaying ? (
                                <Pause className="w-4.5 h-4.5 fill-current" />
                              ) : (
                                <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Speed combo-box */}
                            <select
                              value={playbackSpeed}
                              onChange={(e) =>
                                setPlaybackSpeed(Number(e.target.value))
                              }
                              className="text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-500 rounded-lg py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-3xs shrink-0"
                              title="Playback rate speed"
                            >
                              <option value={0.75}>0.75s</option>
                              <option value={1}>1.0s</option>
                              <option value={1.25}>1.25s</option>
                              <option value={1.5}>1.5s</option>
                            </select>
                          </div>

                          {/* Right: Duration label aligned to the right edge */}
                          <div className="w-14 text-[10px] md:text-[11px] font-mono font-bold text-slate-500 select-none shrink-0 text-right">
                            {formatTime(playbackMs)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SCREEN 5: Vocabulary list management Screen */}
                  {currentScreen === "vocabulary" && selectedArticle && (
                    <motion.div
                      key="vocabulary"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.18 }}
                      className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden select-none"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                    >
                      {/* Scrollable list & Add form */}
                      <div className="flex-1 overflow-y-auto px-1.5 py-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
                        {isTesting ? (
                          /* TESTING INTERACTIVE QUIZ INTERFACE */
                          <div className="mx-1.5 space-y-4">
                            {/* PRACTICE ZONE COMPONENT (Practice Section) */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-2.5">
                              <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase">
                                  Practice Deck Utilities
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={handleToggleReadAll}
                                  disabled={
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                  }
                                  className={`flex items-center justify-center space-x-1 cursor-all py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                      ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                                      : isReadingAll
                                        ? "bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
                                        : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>
                                    {isReadingAll ? "Stop Read" : "Read All"}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleToggleTest}
                                  disabled={
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                  }
                                  className={`flex items-center justify-center space-x-1 cursor-all py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                      ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                                      : isTesting
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                                  }`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>
                                    {isTesting ? "Exit Quiz" : "Test"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Quiz Header with Statistics */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-[11px] font-black tracking-wide text-slate-800 uppercase flex items-center space-x-1.5">
                                  <Check className="w-4 h-4 text-indigo-600" />
                                  <span>Vocabulary Quiz</span>
                                </span>
                                <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
                                  {testQuestions.length} Questions
                                </span>
                              </div>

                              {/* Statistical Results View */}
                              {isTestSubmitted && testResults && (
                                <div className="bg-indigo-50/60 border border-indigo-105/80 rounded-xl p-3 space-y-2">
                                  <h5 className="text-[11px] font-black tracking-wider text-indigo-950 uppercase">
                                    Score Statistics:
                                  </h5>
                                  <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white/90 rounded-md p-1.5 border border-indigo-50">
                                      <p className="text-[9px] font-extrabold text-emerald-600 uppercase">
                                        Correct
                                      </p>
                                      <p className="text-sm font-black text-emerald-700">
                                        {testResults.correct}
                                      </p>
                                    </div>
                                    <div className="bg-white/90 rounded-md p-1.5 border border-indigo-50">
                                      <p className="text-[9px] font-extrabold text-red-500 uppercase">
                                        Wrong
                                      </p>
                                      <p className="text-sm font-black text-red-650">
                                        {testResults.incorrect}
                                      </p>
                                    </div>
                                    <div className="bg-white/90 rounded-md p-1.5 border border-indigo-50">
                                      <p className="text-[9px] font-extrabold text-slate-500 uppercase">
                                        Success
                                      </p>
                                      <p className="text-sm font-black text-slate-700">
                                        {testResults.percentage}%
                                      </p>
                                    </div>
                                  </div>
                                  <div className="pt-1 select-none">
                                    <p className="text-[9px] text-indigo-700 italic font-medium leading-normal">
                                      {testResults.percentage >= 80
                                        ? "🎉 Amazing! You have mastered this deck."
                                        : "💡 Good try! Review wrong choices highlighted below and try again."}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <p className="text-[10px] text-slate-500 leading-normal">
                                {!isTestSubmitted
                                  ? "Go through both parts below. Submit once completed to receive your scores & correct answers!"
                                  : "Quiz submitted! Incorrect selections are light-red. Correct answers are autochecked & bold-emerald."}
                              </p>
                            </div>

                            {/* PART 1: Look at vocabulary and choose correct definition */}
                            <div className="space-y-3">
                              <div className="bg-indigo-50/70 border-l-4 border-indigo-600 px-3 py-2 rounded-r-xl">
                                <span className="text-[10px] font-black tracking-wider text-indigo-950 uppercase block text-left">
                                  Part 1
                                </span>
                                <span className="text-[9px] text-indigo-600 leading-tight block text-left">
                                  Look at the Foreign Word & choose the correct
                                  translation meaning.
                                </span>
                              </div>

                              {testQuestions
                                .filter((q) => q.type === "word-to-meaning")
                                .map((q) => {
                                  const idx = testQuestions.findIndex(
                                    (t) =>
                                      t.vocabId === q.vocabId &&
                                      t.type === q.type,
                                  );
                                  return (
                                    <div
                                      key={`q-${idx}`}
                                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-2.5"
                                    >
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[9px] text-left">
                                        Question {idx + 1}
                                      </p>
                                      <p className="text-sm font-bold text-slate-900 font-article select-all text-left">
                                        "{q.prompt}"
                                      </p>
                                      <div className="space-y-1.5">
                                        {q.options.map((option) => {
                                          const isCorrect =
                                            option === q.correctAnswer;
                                          const isSelectedByUser =
                                            userAnswers[idx] === option;
                                          const isChecked = isTestSubmitted
                                            ? isCorrect
                                            : isSelectedByUser;

                                          let bgClass =
                                            "bg-white border-slate-200";
                                          let fontClass =
                                            "font-normal text-slate-800";

                                          if (isTestSubmitted) {
                                            if (isCorrect) {
                                              bgClass =
                                                "bg-emerald-50 border-emerald-300 text-emerald-900";
                                              fontClass =
                                                "font-black text-emerald-950";
                                            } else if (isSelectedByUser) {
                                              bgClass =
                                                "bg-red-50 border-red-200 text-red-900";
                                              fontClass = "font-normal";
                                            }
                                          } else {
                                            if (isSelectedByUser) {
                                              bgClass =
                                                "bg-indigo-50 border-indigo-500 text-indigo-900";
                                              fontClass =
                                                "font-semibold text-indigo-950";
                                            }
                                          }

                                          return (
                                            <label
                                              key={option}
                                              className={`flex items-start space-x-2 p-2 border rounded-lg transition-all text-xs cursor-default ${bgClass} ${!isTestSubmitted ? "cursor-pointer hover:bg-slate-50" : ""}`}
                                            >
                                              <input
                                                type="radio"
                                                name={`question-${idx}`}
                                                disabled={isTestSubmitted}
                                                checked={isChecked}
                                                onChange={() => {
                                                  if (!isTestSubmitted) {
                                                    setUserAnswers((prev) => ({
                                                      ...prev,
                                                      [idx]: option,
                                                    }));
                                                  }
                                                }}
                                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                              />
                                              <span
                                                className={`text-[11px] leading-snug select-text ${fontClass}`}
                                              >
                                                {option}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>

                            {/* PART 2: Look at definition and choose correct foreign word */}
                            <div className="space-y-3">
                              <div className="bg-teal-50/70 border-l-4 border-teal-600 px-3 py-2 rounded-r-xl">
                                <span className="text-[10px] font-black tracking-wider text-teal-950 uppercase block text-left">
                                  Part 2
                                </span>
                                <span className="text-[9px] text-teal-600 leading-tight block text-left">
                                  Look at the Translation & choose the correct
                                  corresponding Foreign vocabulary word.
                                </span>
                              </div>

                              {testQuestions
                                .filter((q) => q.type === "meaning-to-word")
                                .map((q) => {
                                  const idx = testQuestions.findIndex(
                                    (t) =>
                                      t.vocabId === q.vocabId &&
                                      t.type === q.type,
                                  );
                                  return (
                                    <div
                                      key={`q-${idx}`}
                                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-2.5"
                                    >
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[9px] text-left">
                                        Question {idx + 1}
                                      </p>
                                      <p className="text-sm font-bold text-slate-900 font-article select-all text-left">
                                        "{q.prompt}"
                                      </p>
                                      <div className="space-y-1.5">
                                        {q.options.map((option) => {
                                          const isCorrect =
                                            option === q.correctAnswer;
                                          const isSelectedByUser =
                                            userAnswers[idx] === option;
                                          const isChecked = isTestSubmitted
                                            ? isCorrect
                                            : isSelectedByUser;

                                          let bgClass =
                                            "bg-white border-slate-200";
                                          let fontClass =
                                            "font-normal text-slate-800";

                                          if (isTestSubmitted) {
                                            if (isCorrect) {
                                              bgClass =
                                                "bg-emerald-50 border-emerald-300 text-emerald-900";
                                              fontClass =
                                                "font-black text-emerald-950";
                                            } else if (isSelectedByUser) {
                                              bgClass =
                                                "bg-red-50 border-red-200 text-red-900";
                                              fontClass = "font-normal";
                                            }
                                          } else {
                                            if (isSelectedByUser) {
                                              bgClass =
                                                "bg-indigo-50 border-indigo-500 text-indigo-900";
                                              fontClass =
                                                "font-semibold text-indigo-950";
                                            }
                                          }

                                          return (
                                            <label
                                              key={option}
                                              className={`flex items-start space-x-2 p-2 border rounded-lg transition-all text-xs cursor-default ${bgClass} ${!isTestSubmitted ? "cursor-pointer hover:bg-slate-50" : ""}`}
                                            >
                                              <input
                                                type="radio"
                                                name={`question-${idx}`}
                                                disabled={isTestSubmitted}
                                                checked={isChecked}
                                                onChange={() => {
                                                  if (!isTestSubmitted) {
                                                    setUserAnswers((prev) => ({
                                                      ...prev,
                                                      [idx]: option,
                                                    }));
                                                  }
                                                }}
                                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                              />
                                              <span
                                                className={`text-[11px] leading-snug select-text ${fontClass}`}
                                              >
                                                {option}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>

                            {/* Quiz Action Buttons */}
                            <div className="flex items-center space-x-2 pt-2 pb-6">
                              <button
                                type="button"
                                onClick={handleToggleTest}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                              >
                                Exit Quiz
                              </button>

                              {!isTestSubmitted && (
                                <button
                                  type="button"
                                  onClick={handleSubmitTest}
                                  disabled={
                                    Object.keys(userAnswers).length <
                                    testQuestions.length
                                  }
                                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-all text-center ${
                                    Object.keys(userAnswers).length <
                                    testQuestions.length
                                      ? "bg-slate-150 text-slate-400 cursor-not-allowed border border-slate-200"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-3xs"
                                  }`}
                                >
                                  Submit ({Object.keys(userAnswers).length}/
                                  {testQuestions.length})
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* ORIGINAL VIEW: Insert list item & Saved expressions list deck */
                          <>
                            {/* COMPOSITE CARD: Add a new voc item */}
                            <form
                              onSubmit={handleAddVocab}
                              className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-2.5 mx-1.5 transition-all duration-300"
                            >
                              <div
                                onClick={() => setIsInsertExpressionExpanded(!isInsertExpressionExpanded)}
                                className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1 font-sans cursor-pointer select-none group"
                                title="Click to Collapse/Expand Insert Expression form"
                              >
                                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase flex items-center space-x-1 group-hover:text-indigo-500 transition-colors">
                                  <Plus className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isInsertExpressionExpanded ? 'rotate-45 text-red-500' : 'text-indigo-600'}`} />
                                  <span>Insert Expression</span>
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                                  {isInsertExpressionExpanded ? "[ Collapse ]" : "[ Expand ]"}
                                </span>
                              </div>

                              {isInsertExpressionExpanded && (
                                <div className="space-y-2.5 pt-0.5 animate-fadeIn">
                                  {/* Inputs row 1: Word */}
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      required
                                      value={newWord}
                                      onChange={(e) => setNewWord(e.target.value)}
                                      placeholder="Foreign Word (e.g., umsteigen)"
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850 outline-none transition-all select-text"
                                    />
                                  </div>

                                  {/* Inputs row 2: Definition */}
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      required
                                      value={newDefinition}
                                      onChange={(e) =>
                                        setNewDefinition(e.target.value)
                                      }
                                      placeholder="Translation/Meaning (e.g., to transfer)"
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850 outline-none transition-all select-text"
                                    />
                                  </div>

                                  {/* Inputs row 3: Example (Optional) */}
                                  <div className="space-y-1">
                                    <textarea
                                      rows={2}
                                      value={newExample}
                                      onChange={(e) =>
                                        setNewExample(e.target.value)
                                      }
                                      placeholder="Example sentence (optional)"
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850 outline-none transition-all resize-none select-text"
                                    />
                                  </div>

                                  {/* Submit action */}
                                  <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                                  >
                                    Add to Article
                                  </button>
                                </div>
                              )}
                            </form>

                            {/* PRACTICE ZONE COMPONENT (Practice Section) */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-2.5 mx-1.5">
                              <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-1.5 font-sans">
                                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase">
                                  Practice Deck
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={handleToggleReadAll}
                                  disabled={
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                  }
                                  className={`flex items-center justify-center space-x-1 cursor-all py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                      ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                                      : isReadingAll
                                        ? "bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
                                        : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>
                                    {isReadingAll ? "Stop Read" : "Read All"}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleToggleTest}
                                  disabled={
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                  }
                                  className={`flex items-center justify-center space-x-1 cursor-all py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                                    (selectedArticle.vocabulary || [])
                                      .length === 0
                                      ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                                      : isTesting
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                                  }`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>
                                    {isTesting ? "Exit Quiz" : "Test"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* VOCABULARY ITEMS DECK SECTION */}
                            <div className="space-y-2 px-1.5 pb-6">
                              <div className="flex justify-between items-center px-1 font-sans">
                                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                                  Saved Expressions (
                                  {(selectedArticle.vocabulary || []).length})
                                </span>
                              </div>

                              {!selectedArticle.vocabulary ||
                              selectedArticle.vocabulary.length === 0 ? (
                                <div className="text-center py-8 px-4 bg-white/70 border border-dashed border-slate-200 rounded-xl space-y-1.5">
                                  <p className="text-[11px] font-bold text-slate-500 leading-normal">
                                    No vocabulary records.
                                  </p>
                                  <p className="text-[9px] text-slate-400 max-w-[190px] mx-auto leading-normal">
                                    Insert essential foreign statements and
                                    translations above to grow your virtual Room
                                    DB dataset!
                                  </p>
                                </div>
                              ) : (
                                (selectedArticle.vocabulary || []).map(
                                  (vocab, mapIdx) => {
                                    const isEditingIdx =
                                      editingVocabId === vocab.id;
                                    const isCurrentItemReading =
                                      isReadingAll && autoReadIndex === mapIdx;
                                    return (
                                      <div
                                        key={vocab.id}
                                        className={`border rounded-xl p-3 shadow-3xs space-y-2 transition-all duration-150 ${
                                          isEditingIdx
                                            ? "border-amber-300 bg-amber-50/20"
                                            : isCurrentItemReading
                                              ? "border-blue-400 bg-blue-50/70 shadow-sm"
                                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/10"
                                        }`}
                                      >
                                        {isEditingIdx ? (
                                          /* Inline Editing Mode UI */
                                          <div className="space-y-2.5">
                                            <div className="flex items-center justify-between text-[9px] text-amber-700 font-bold border-b border-amber-100 pb-1">
                                              <span>editing record</span>
                                            </div>
                                            <div className="space-y-2">
                                              <input
                                                type="text"
                                                value={editingWord}
                                                onChange={(e) =>
                                                  setEditingWord(e.target.value)
                                                }
                                                placeholder="Word"
                                                className="w-full bg-white border border-amber-250 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-400 select-text"
                                              />
                                              <input
                                                type="text"
                                                value={editingDefinition}
                                                onChange={(e) =>
                                                  setEditingDefinition(
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Translation"
                                                className="w-full bg-white border border-amber-250 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-400 select-text"
                                              />
                                              <textarea
                                                rows={2}
                                                value={editingExample}
                                                onChange={(e) =>
                                                  setEditingExample(
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Example"
                                                className="w-full bg-white border border-amber-250 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-400 resize-none select-text"
                                              />
                                            </div>
                                            <div className="flex items-center justify-end space-x-1.5 pt-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setEditingVocabId(null)
                                                }
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold px-2.5 py-1 rounded text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                onClick={handleSaveEditVocab}
                                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                                              >
                                                Save
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          /* Normal Card Read Mode UI */
                                          <div className="space-y-1">
                                            <div className="flex items-start justify-between gap-1">
                                              <div
                                                onClick={() =>
                                                  speakSingleWord(vocab.word)
                                                }
                                                className="min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-all text-left"
                                              >
                                                {/* Foreign Word using Signika font, dynamic size controlled via zoom, allowed to flow over multiple lines */}
                                                <p
                                                  className={`${vocabFontSize} font-semibold text-slate-950 font-article break-words leading-tight select-all`}
                                                >
                                                  {vocab.word}
                                                </p>
                                                {/* Translation Meaning */}
                                                <p className="text-[11px] font-medium text-slate-500 italic mt-0.5 select-all leading-snug">
                                                  {vocab.definition}
                                                </p>
                                              </div>

                                              {/* Action buttons (Edit & Delete) */}
                                              <div className="vocab-item-actions flex items-center space-x-1.5 shrink-0 z-10">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleStartEditVocab(vocab)
                                                  }
                                                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-650 transition-colors cursor-pointer"
                                                  title="Edit vocab"
                                                >
                                                  <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleDeleteVocab(vocab.id)
                                                  }
                                                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
                                                  title="Delete vocab"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Example section (Clicking this is ignored for TTS as requested) */}
                                            {vocab.exampleSentence && (
                                              <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-left select-all">
                                                <p className="text-[10px] text-slate-400 leading-normal font-medium bg-slate-50/55 p-1 px-1.5 rounded-md">
                                                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[8px] mr-1 font-sans">
                                                    Ex:
                                                  </span>
                                                  "{vocab.exampleSentence}"
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  },
                                )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                  {/* SCREEN 4: Edit/Create Article Screen */}
                  {currentScreen === "edit-article" && (
                    <div className="p-4 flex-grow flex flex-col space-y-4 bg-white h-full overflow-y-auto">
                      <div className="space-y-3.5 flex-1 flex flex-col">
                        {/* Title Input */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Article Title
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Enter catchy Title..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 transition-all outline-none"
                          />
                        </div>

                        {/* Cover Image Selector & Uploader */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            COVER PICTURE
                          </label>
                          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/85 p-2 rounded-xl">
                            {/* Current Cover Preview */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                              {editImageUrl ? (
                                <img
                                  src={editImageUrl}
                                  alt="Selected Cover"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-slate-400 text-[10px] text-center px-1 font-semibold">
                                  No cover
                                </span>
                              )}
                            </div>

                            {/* Presets and Upload trigger */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                  Presets OR Custom File
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    document
                                      .getElementById("cover-image-upload")
                                      ?.click()
                                  }
                                  className="text-[9px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
                                >
                                  Upload File
                                </button>
                                <input
                                  type="file"
                                  id="cover-image-upload"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          setRawUploadedImage(
                                            event.target.result as string,
                                          );
                                          setCropZoom(1);
                                          setCropOffset({ x: 0, y: 0 });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                      // Clear value so the same file can be selected again if desired
                                      e.target.value = "";
                                    }
                                  }}
                                  className="hidden"
                                />
                              </div>

                              {/* Preset images row */}
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                                {ARTICLE_IMAGES.map((img, idx) => {
                                  const isSelected = editImageUrl === img;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setEditImageUrl(img)}
                                      className={`relative w-8 h-8 rounded-md overflow-hidden border transition-all shrink-0 hover:scale-[1.05] active:scale-95 ${
                                        isSelected
                                          ? "border-indigo-600 ring-2 ring-indigo-500/20"
                                          : "border-slate-250 hover:border-slate-400"
                                      }`}
                                    >
                                      <img
                                        src={img}
                                        alt={`Preset ${idx + 1}`}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-indigo-600/35 flex items-center justify-center">
                                          <Check className="w-4 h-4 text-white stroke-[3px]" />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Audio File Selection & Copy to Local DB representation */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            AUDIO SYNC FILE
                          </label>
                          <div className="bg-slate-50 border border-slate-200/85 p-2 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                                {editAudioUrl
                                  ? "✓ Connected audio block"
                                  : "No synced audio file"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  document
                                    .getElementById("audio-file-upload")
                                    ?.click()
                                }
                                className="bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md text-[9px] font-extrabold text-indigo-600 border border-indigo-200/50 transition-colors cursor-pointer"
                              >
                                Choose Audio
                              </button>
                              <input
                                type="file"
                                id="audio-file-upload"
                                accept="audio/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        // Set data url as simulated DB file representation
                                        setEditAudioUrl(
                                          event.target.result as string,
                                        );
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </div>

                            {/* Status detail representing "copied to local database folder" */}
                            {editAudioUrl && (
                              <div className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-200/50 p-1.5 rounded font-mono leading-normal flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                                <span className="break-all font-semibold">
                                  Copied stream cleanly to local DB folder
                                  (/data/raw/audio_*.bin)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content Input */}
                        <div className="space-y-2 flex-grow flex flex-col min-h-[160px]">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              CONTENT (SUPPORT .SRT FORMAT)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                if (!editContent.trim()) {
                                  setEditContent(
                                    `1\n00:00:01,000 --> 00:00:04,500\nHello and welcome!\n\n2\n00:00:05,000 --> 00:00:09,000\nThis is a sample SRT subtitle string.`,
                                  );
                                }
                              }}
                              className="text-[9px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              Template Helper
                            </button>
                          </div>

                          {/* Quick Commands Toolbar */}
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/85 p-1 rounded-xl">
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".txt,.srt"
                              onChange={handleOpenFile}
                            />
                            <button
                              type="button; button-open-file"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-1 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-3xs active:scale-95"
                              title="Import a .txt or .srt file from your device"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>Open</span>
                            </button>

                            {/* Formatting tags */}
                            <button
                              type="button; button-bold"
                              onClick={() => applyStyleTag("<b>", "</b>")}
                              className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-3xs active:scale-90 transition-all cursor-pointer text-xs font-bold"
                              title="Bold text <b>"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button; button-italic"
                              onClick={() => applyStyleTag("<i>", "</i>")}
                              className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-3xs active:scale-90 transition-all cursor-pointer text-xs font-bold"
                              title="Italic text <i>"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button; button-underline"
                              onClick={() => applyStyleTag("<u>", "</u>")}
                              className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-3xs active:scale-90 transition-all cursor-pointer text-xs font-bold"
                              title="Underline text <u>"
                            >
                              <Underline className="w-3.5 h-3.5" />
                            </button>

                            {/* Picker color popup button */}
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="p-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-3xs active:scale-90 transition-all cursor-pointer text-xs font-bold flex items-center space-x-1"
                                title="Picker color"
                              >
                                <Palette className="w-3.5 h-3.5" style={{ color: customColor }} />
                                <span className="text-[8px] text-slate-500 font-normal">▼</span>
                              </button>

                              {showColorPicker && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowColorPicker(false)}
                                  />
                                  <div className="absolute right-0 mt-1 p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 flex flex-col space-y-2 min-w-[145px]">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Palette Colors</span>
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {["#ef4444", "#10b981", "#3b82f6", "#fbbf24", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4"].map((clr) => (
                                        <button
                                          key={clr}
                                          type="button"
                                          onClick={() => {
                                            setCustomColor(clr);
                                            applyStyleTag(`<font color="${clr}">`, "</font>");
                                            setShowColorPicker(false);
                                          }}
                                          className="w-4.5 h-4.5 rounded-full border border-slate-200 shadow-3xs hover:scale-110 active:scale-90 transition-all cursor-pointer shrink-0"
                                          style={{ backgroundColor: clr }}
                                          title={clr}
                                        />
                                      ))}
                                    </div>
                                    <div className="border-t border-slate-100 my-1" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Custom Color</span>
                                    <div className="flex items-center space-x-1.5">
                                      <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="w-6 h-6 cursor-pointer rounded-md border border-slate-200 p-0 overflow-hidden bg-transparent shrink-0"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          applyStyleTag(`<font color="${customColor}">`, "</font>");
                                          setShowColorPicker(false);
                                        }}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-1 px-1 rounded text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-3xs text-center"
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="w-[1px] h-4 bg-slate-200 self-center mx-0.5" />

                            <button
                              type="button"
                              onClick={() => setEditorFontSize((prev) => Math.max(10, prev - 1))}
                              disabled={editorFontSize <= 10}
                              className="p-1 px-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 text-slate-700 rounded-md shadow-3xs active:scale-90 transition-all cursor-pointer text-xs font-bold flex items-center justify-center"
                              title="Decrease Font Size"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditorFontSize((prev) => Math.min(24, prev + 1))}
                              disabled={editorFontSize >= 24}
                              className="p-1 px-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 text-slate-700 rounded-md shadow-3xs active:scale-90 transition-all cursor-pointer text-xs font-bold flex items-center justify-center"
                              title="Increase Font Size"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="1\n00:00:01,000 --> 00:00:04,500\nYour subtitle line\n..."
                            className="w-full flex-grow bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 font-article text-slate-800 placeholder-slate-400 transition-all outline-none resize-none overflow-y-auto leading-relaxed"
                            style={{ fontSize: `${editorFontSize}px` }}
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2 pt-2">
                          {!isEditingNew && (
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="w-1/4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                            >
                              Delete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentScreen(
                                isEditingNew ? "articles" : "article-detail",
                              );
                            }}
                            className={`${isEditingNew ? "w-1/3" : "w-1/4"} bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl border border-slate-200 transition-all cursor-pointer text-center`}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!editTitle.trim() || !editContent.trim()}
                            onClick={() => {
                              if (isEditingNew) {
                                if (onAddArticle && selectedTopic) {
                                  onAddArticle(
                                    selectedTopic.id,
                                    editTitle,
                                    editType,
                                    editContent,
                                    editImageUrl,
                                    editAudioUrl,
                                  );
                                  setCurrentScreen("articles");
                                }
                              } else {
                                if (onUpdateArticle && selectedArticle) {
                                  onUpdateArticle(
                                    selectedArticle.id,
                                    editTitle,
                                    editType,
                                    editContent,
                                    editImageUrl,
                                    editAudioUrl,
                                  );
                                  const updated = {
                                    ...selectedArticle,
                                    title: editTitle,
                                    type: editType,
                                    content: editContent,
                                    imageUrl: editImageUrl,
                                    audioUrl: editAudioUrl,
                                  };
                                  setSelectedArticle(updated);
                                  setCurrentScreen("article-detail");
                                }
                              }
                            }}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100 text-center"
                          >
                            {isEditingNew ? "Create article" : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 6: Settings Screen */}
                  {currentScreen === "settings" && (
                    <div className="flex-1 flex flex-col h-full bg-slate-50 select-none overflow-y-auto p-4 space-y-4">
                      {/* VDB BACKUP DATA SHARING */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs space-y-3">
                        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                          <HardDrive className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase">
                            VDB Backup Data Sharing
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Safely export all your learning topics, articles, and vocabulary database to a <code>.vdb</code> file, or restore from a previously exported backup.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleExportVdb}
                            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                            title="Backup database to a .vdb compressed file and save locally"
                          >
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span>Export Backup</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => backupFileInputRef.current?.click()}
                            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                            title="Restore database by importing a .vdb backup file"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span>Import Backup</span>
                          </button>
                        </div>
                      </div>

                      {/* GOOGLE DRIVE SYNC */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs space-y-3">
                        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                          <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase">
                            Google Drive Sync
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Sync your data securely to the cloud. Link your Google account to enable auto-backup or manually trigger uploads and downloads.
                        </p>
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowSyncSetupDialog(true)}
                            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer"
                            title="Link your Google Account for cloud storage backups"
                          >
                            <Cloud className="w-3.5 h-3.5 shrink-0" />
                            <span>Account Synchronization Settings</span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleGoogleDriveSync('upload')}
                              className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Manually upload data from phone into secure Google Drive storage"
                            >
                              <CloudUpload className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Manual Upload</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGoogleDriveSync('download')}
                              className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Manually download data from Google Drive and restore local phone state"
                            >
                              <CloudDownload className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Manual Download</span>
                            </button>
                          </div>
                        </div>
                      </div>


                    </div>
                  )}

                  {/* Custom Material 3 style Delete Confirmation Dialog */}
                  {showDeleteConfirm && (
                    <div
                      id="delete-confirmation-overlay"
                      className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-xs"
                    >
                      <div
                        id="delete-confirmation-dialog"
                        className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 w-full max-w-[280px] space-y-4"
                      >
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
                            Delete Article?
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-slate-800">
                              "{selectedArticle?.title}"
                            </span>
                            ? This will permanently remove it from the Room
                            virtual database.
                          </p>
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            id="cancel-delete-btn"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            id="confirm-delete-btn"
                            onClick={() => {
                              if (onDeleteArticle && selectedArticle) {
                                onDeleteArticle(selectedArticle.id);
                                setSelectedArticle(null);
                                setShowDeleteConfirm(false);
                                setCurrentScreen("articles");
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-red-150"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Introduction Dialog Overlay */}
                  {showIntroDialog && (
                    <div
                      id="intro-dialog-overlay"
                      className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-xs"
                    >
                      <div
                        id="intro-dialog"
                        className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 w-full max-w-[280px] space-y-4"
                      >
                        <div className="space-y-2 text-left">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                            About App
                          </h3>
                          <div className="text-[11px] text-slate-650 space-y-2 leading-relaxed">
                            <p>
                              <strong className="text-slate-850">
                                Purpose:
                              </strong>{" "}
                              Supports foreign language learning through
                              synchronized SRT subtitles.
                            </p>
                            <p>
                              <strong className="text-slate-850">
                                Year Created:
                              </strong>{" "}
                              2026
                            </p>
                            <p>
                              <strong className="text-slate-850 font-bold">
                                Copyright:
                              </strong>{" "}
                              belongs to{" "}
                              <span className="font-semibold text-slate-800 font-bold">
                                LuongLQ
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setShowIntroDialog(false)}
                            className="px-4 py-1.5 rounded-xl bg-[#f9f9fc] hover:bg-[#eef0f6] text-[#75787a] text-xs font-bold transition-all cursor-pointer border border-slate-200/60 shadow-sm"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exit Confirmation Dialog Overlay */}
                  {showExitDialog && (
                    <div
                      id="exit-dialog-overlay"
                      className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-xs"
                    >
                      <div
                        id="exit-dialog"
                        className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 w-full max-w-[280px] space-y-4"
                      >
                        <div className="space-y-2 text-left">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <X className="w-5 h-5 text-red-500 shrink-0" />
                            Exit Application?
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Are you sure you want to close and exit the language
                            learning application?
                          </p>
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowExitDialog(false)}
                            className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowExitDialog(false);
                              if (typeof window !== "undefined") {
                                try {
                                  // Attempt browser tab or window closure
                                  window.close();
                                } catch (e) {}
                                try {
                                  // Fallback closure indicator or redirect
                                  window.location.href = "about:blank";
                                } catch (e) {}
                              }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-red-150"
                          >
                            Exit App
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Google Drive Sync Setup Dialog Overlay */}
                  {showSyncSetupDialog && (
                    <div
                      id="sync-setup-dialog-overlay"
                      className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-xs"
                    >
                      <div
                        id="sync-setup-dialog"
                        className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 w-full max-w-[280px] space-y-4"
                      >
                        <div className="space-y-2 text-left">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-emerald-500 shrink-0" />
                            Account Sync Setup
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Enable serverless replication to securely backup and reconcile foreign language topics and subtitle catalogs across your devices.
                          </p>

                          {isDriveConnected ? (
                            <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 space-y-1.5 mt-2">
                              <div className="flex items-center space-x-1 text-[11px] text-emerald-850 font-bold">
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Connected Successfully</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                                Active sync account: <br />
                                <span className="font-mono text-indigo-650 font-semibold select-all break-all text-[9.5px]">lqluong.2047@gmail.com</span>
                              </p>
                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsDriveConnected(false);
                                    localStorage.removeItem("vdb_drive_connected");
                                  }}
                                  className="w-full text-center text-[10px] py-1 text-red-650 hover:bg-red-50 hover:text-red-750 font-bold border border-red-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  Disconnect Account
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2.5">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                Provider Credentials
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsDriveConnected(true);
                                  localStorage.setItem("vdb_drive_connected", "true");
                                }}
                                className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 py-2 px-3 rounded-xl transition-all cursor-pointer shadow-3xs"
                              >
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                </svg>
                                <span className="text-[11px] font-bold text-slate-700">Sign in with Google</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setShowSyncSetupDialog(false)}
                            className="px-4 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer border border-slate-200/65 shadow-xs"
                            style={{ color: '#898585' }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cover Image Cropping Overlay */}
                  {rawUploadedImage && (
                    <div
                      id="cover-crop-dialog-overlay"
                      className="absolute inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs"
                    >
                      <div
                        id="cover-crop-dialog"
                        className="bg-white rounded-3xl p-4.5 shadow-xl border border-slate-250 w-full max-w-[280px] space-y-3.5"
                      >
                        <div className="space-y-1 text-left">
                          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                            <Crop className="w-4 h-4 text-indigo-600 shrink-0" />
                            Crop Cover Image
                          </h3>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Drag image to center, and scale using the slider to fit.
                          </p>
                        </div>

                        {/* Drag and drop panel area */}
                        <div
                          onMouseDown={handleCropMouseDown}
                          onMouseMove={handleCropMouseMove}
                          onMouseUp={handleCropMouseUp}
                          onMouseLeave={handleCropMouseUp}
                          onTouchStart={handleCropTouchStart}
                          onTouchMove={handleCropTouchMove}
                          onTouchEnd={handleCropTouchEnd}
                          className="relative w-full h-36 bg-slate-950 border border-slate-200 rounded-2xl overflow-hidden cursor-move select-none shadow-inner flex items-center justify-center"
                        >
                          <img
                            src={rawUploadedImage}
                            alt="Cropping Dynamic"
                            referrerPolicy="no-referrer"
                            style={{
                              transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                              transformOrigin: "center center",
                            }}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          
                          {/* Visible cropping outline border overlay */}
                          <div className="absolute inset-0 border-2 border-indigo-600 rounded-2xl pointer-events-none opacity-90 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]" />
                          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 bg-slate-900/85 text-white font-sans text-[7px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest pointer-events-none">
                            Drag to pan
                          </div>
                        </div>

                        {/* Slider Controller */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">
                            <span>Zoom Style</span>
                            <span className="text-indigo-600 font-mono text-[9px]">{cropZoom.toFixed(2)}x</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="3.5"
                            step="0.05"
                            value={cropZoom}
                            onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                            className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Save Cancel triggers */}
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setRawUploadedImage(null)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#898585] text-[11px] font-extrabold transition-all cursor-pointer border border-slate-200/65 shadow-3xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCrop}
                            className="flex-1 px-3 py-1.5 rounded-xl text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-sm"
                            style={{ backgroundColor: '#c155a6' }}
                          >
                            Apply Crop
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Hidden input for VDB backups */}
                  <input
                    type="file"
                    ref={backupFileInputRef}
                    onChange={handleImportVdb}
                    accept=".vdb,.json"
                    className="hidden"
                  />
                </div>
    </div>
  );
};
