import React, { useRef, useState, useEffect } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Plus, 
  Check, 
  Palette, 
  Trash2, 
  FileText,
  RotateCcw,
  Edit2,
  Highlighter,
  ListOrdered,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough
} from "lucide-react";
import { Article } from "../types";

interface PointsToNoteProps {
  article: Article;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  onSaveNotes: (html: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}

const PRESET_COLORS = [
  { value: "#20124D", label: "Default" },
  { value: "#B73F9B", label: "Purple" },
  { value: "#0E7490", label: "Ocean" },
  { value: "#15803D", label: "Green" },
  { value: "#E11D48", label: "Coral" }
];

const PRESET_HIGHLIGHTS = [
  { value: "#FEF08A", label: "Yellow" },
  { value: "#BBF7D0", label: "Green" },
  { value: "#FBCFE8", label: "Pink" },
  { value: "transparent", label: "None" }
];

const SIZE_MAP_REVERSE: Record<string, string> = {
  "1": "10",
  "2": "12",
  "3": "14",
  "4": "16",
  "5": "18",
  "6": "20",
  "7": "24",
};

const SIZE_MAP: Record<string, string> = {
  "10": "1",
  "12": "2",
  "14": "3",
  "16": "4",
  "18": "5",
  "20": "6",
  "24": "7",
};

export const PointsToNote: React.FC<PointsToNoteProps> = ({
  article,
  isEditMode,
  setIsEditMode,
  onSaveNotes,
  onTouchStart,
  onTouchEnd,
  onMouseDown,
  onMouseUp,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [activeColor, setActiveColor] = useState<string>("#20124D");
  const [activeHighlight, setActiveHighlight] = useState<string>("transparent");

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    unorderedList: false,
    orderedList: false,
    h: false,
    p: true,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    fontSize: "14"
  });

  const [blockTypeOpen, setBlockTypeOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [textStyleOpen, setTextStyleOpen] = useState(false);
  const [alignOpen, setAlignOpen] = useState(false);

  const updateActiveStates = () => {
    try {
      const fbVal = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
      const fsVal = String(document.queryCommandValue("fontSize") || "");
      const mappedFontSize = SIZE_MAP_REVERSE[fsVal] || "14";

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikeThrough"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        h: fbVal === "h3" || fbVal === "heading 3" || fbVal === "<h3>",
        p: fbVal === "p" || fbVal === "normal" || fbVal === "heading-normal" || fbVal === "div" || fbVal === "<p>" || fbVal === "" || fbVal === "null",
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        fontSize: mappedFontSize
      });

      const colorVal = document.queryCommandValue("foreColor");
      if (colorVal) {
        setActiveColor(colorVal);
      }
      const backColorVal = document.queryCommandValue("backColor") || document.queryCommandValue("hiliteColor");
      if (backColorVal) {
        setActiveHighlight(backColorVal);
      }
    } catch (e) {
      // safe fallback
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveStates();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Load notes initially
  useEffect(() => {
    const defaultText = article.notes || `<b>Important points to note:</b>
<ul>
  <li>Double-click or select any text to change its format, color, or highlight.</li>
  <li>List down key phrases or idioms with corresponding grammar tips.</li>
  <li>Write down explanations or custom translations for phrases.</li>
</ul>`;
    setHtmlContent(defaultText);
  }, [article.id, article.notes]);

  // Sync internal state into editable div ref if edited state changes or mounts
  useEffect(() => {
    if (editorRef.current && isEditMode) {
      editorRef.current.innerHTML = htmlContent;
      // Focus on editor in edit mode
      setTimeout(() => {
        editorRef.current?.focus();
        updateActiveStates();
      }, 50);
    }
  }, [isEditMode]);

  // Auto-save notes when switching back to read mode (e.g. from top bar Done click)
  const prevEditModeRef = useRef(isEditMode);
  useEffect(() => {
    if (prevEditModeRef.current && !isEditMode) {
      onSaveNotes(htmlContent);
    }
    prevEditModeRef.current = isEditMode;
  }, [isEditMode, htmlContent, onSaveNotes]);

  // Execute standard text formatting command
  const format = (command: string, value: string = "") => {
    try {
      if (command === "formatBlock") {
        const success = document.execCommand(command, false, value);
        if (!success) {
          const stripped = value.replace(/[<>]/g, "");
          document.execCommand(command, false, stripped);
        }
      } else {
        document.execCommand(command, false, value);
      }
    } catch (e) {
      console.warn("Formatting failed", command, value, e);
    }
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    updateActiveStates();
  };

  const handleInput = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  const handleSave = () => {
    let finalHtml = htmlContent;
    if (editorRef.current) {
      finalHtml = editorRef.current.innerHTML;
    }
    onSaveNotes(finalHtml);
    setIsEditMode(false);
  };

  const handleEditorClick = () => {
    setBlockTypeOpen(false);
    setFontSizeOpen(false);
    setColorPickerOpen(false);
    setHighlightPickerOpen(false);
    setTextStyleOpen(false);
    setAlignOpen(false);
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {isEditMode ? (
        /* Edit Mode Layout */
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Elegant full-width single-row toolbar placed directly at the top of the editor */}
          <div className="bg-white border-b border-slate-200 flex items-center justify-start md:justify-center overflow-x-auto shrink-0 select-none relative z-40 w-full h-11 px-3 gap-0.5 md:gap-1.5 scrollbar-none">
            
            {/* Block 1: Body & Heading Selection */}
            <div className="relative h-full flex items-center px-1 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setBlockTypeOpen(!blockTypeOpen);
                  setFontSizeOpen(false);
                  setColorPickerOpen(false);
                  setHighlightPickerOpen(false);
                  setTextStyleOpen(false);
                  setAlignOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-slate-50 active:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition cursor-pointer min-w-[72px] justify-between h-8 border border-slate-200 bg-white"
              >
                <span>{activeFormats.h ? "Heading" : "Body"}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {blockTypeOpen && (
                <div className="absolute top-[38px] left-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px] text-xs font-medium text-slate-700 animate-slide-up">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("formatBlock", "<p>");
                      setBlockTypeOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <span>Body</span>
                    {!activeFormats.h && <Check className="w-3.5 h-3.5 text-indigo-650 stroke-[2.5]" />}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("formatBlock", "<h3>");
                      setBlockTypeOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <span>Heading</span>
                    {activeFormats.h && <Check className="w-3.5 h-3.5 text-indigo-650 stroke-[2.5]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Separator 1 */}
            <div className="w-px h-6 bg-[#EEEEEC] shrink-0 self-center mx-1" />

            {/* Block 2: Font Size Selector */}
            <div className="relative h-full flex items-center px-1 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFontSizeOpen(!fontSizeOpen);
                  setBlockTypeOpen(false);
                  setColorPickerOpen(false);
                  setHighlightPickerOpen(false);
                  setTextStyleOpen(false);
                  setAlignOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-slate-50 active:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition cursor-pointer min-w-[50px] justify-between h-8 border border-slate-200 bg-white"
              >
                <span>{activeFormats.fontSize}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {fontSizeOpen && (
                <div className="absolute top-[38px] left-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[70px] text-xs font-medium text-slate-700">
                  {["10", "12", "14", "16", "18", "20", "24"].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("fontSize", SIZE_MAP[sz]);
                        setFontSizeOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                    >
                      <span>{sz}</span>
                      {activeFormats.fontSize === sz && <Check className="w-3.5 h-3.5 text-indigo-640 stroke-[2.5]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator 2 */}
            <div className="w-px h-6 bg-[#EEEEEC] shrink-0 self-center mx-1" />

            {/* Block 3: Text Color Picker */}
            <div className="relative h-full flex items-center px-1 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setColorPickerOpen(!colorPickerOpen);
                  setBlockTypeOpen(false);
                  setFontSizeOpen(false);
                  setHighlightPickerOpen(false);
                  setTextStyleOpen(false);
                  setAlignOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-slate-50 active:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition cursor-pointer h-8 border border-slate-200 bg-white"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-slate-200 shadow-5xs shrink-0" 
                  style={{ backgroundColor: activeColor }}
                />
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {colorPickerOpen && (
                <div className="absolute top-[38px] left-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 w-[120px]">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { value: "#3B82F6", label: "Blue" },
                      { value: "#10B981", label: "Green" },
                      { value: "#8B5CF6", label: "Purple" },
                      { value: "#EC4899", label: "Pink" },
                      { value: "#1F2937", label: "Charcoal" },
                      { value: "#92400E", label: "Brown" },
                      { value: "#F97316", label: "Orange" },
                      { value: "#E11D48", label: "Crimson" },
                    ].map((cp) => {
                      const isCurrent = activeColor.toLowerCase() === cp.value.toLowerCase() || 
                        (cp.value.toLowerCase() === "#1f2937" && (activeColor === "" || activeColor.toLowerCase() === "inherit" || activeColor.toLowerCase() === "#20124d" || activeColor.toLowerCase() === "rgb(32, 18, 77)"));
                      return (
                        <button
                          key={cp.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            format("foreColor", cp.value);
                            setActiveColor(cp.value);
                            setColorPickerOpen(false);
                          }}
                          className="w-5 h-5 rounded-full border border-slate-200/50 flex items-center justify-center transition hover:scale-110 cursor-pointer relative"
                          style={{ backgroundColor: cp.value }}
                          title={cp.label}
                        >
                          {isCurrent && (
                            <Check className="w-3 h-3 text-white stroke-[3.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Separator 3 */}
            <div className="w-px h-6 bg-[#EEEEEC] shrink-0 self-center mx-1" />

            {/* Block 4: Bold, Italic, Underline, Strikethrough (Style Group) */}
            {/* Desktop version (Individual buttons) */}
            <div className="hidden md:flex items-center px-1.5 gap-0.5 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("bold")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.bold
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-700 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Bold"
              >
                <span className="font-serif font-extrabold text-[15px] select-none text-slate-800">B</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("italic")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.italic
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Italic"
              >
                <span className="font-serif italic text-[15px] select-none text-slate-850">I</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("underline")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.underline
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Underline"
              >
                <span className="font-serif underline text-[15px] select-none text-slate-850">U</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("strikeThrough")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.strikethrough
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Strikethrough"
              >
                <span className="font-serif line-through text-[15px] select-none text-slate-850">S</span>
              </button>
            </div>

            {/* Mobile/Phone version ("Text-style" combo box dropdown) */}
            <div className="relative h-full flex items-center px-0.5 md:hidden shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTextStyleOpen(!textStyleOpen);
                  setAlignOpen(false);
                  setBlockTypeOpen(false);
                  setFontSizeOpen(false);
                  setColorPickerOpen(false);
                  setHighlightPickerOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 hover:bg-slate-50 active:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition cursor-pointer min-w-[88px] justify-between h-8 border ${
                  activeFormats.bold || activeFormats.italic || activeFormats.underline || activeFormats.strikethrough
                    ? "border-indigo-200 bg-indigo-50/40 text-indigo-700"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="truncate">
                  {activeFormats.bold ? "B" : ""}{activeFormats.italic ? "I" : ""}{activeFormats.underline ? "U" : ""}{activeFormats.strikethrough ? "S" : ""}
                  {!(activeFormats.bold || activeFormats.italic || activeFormats.underline || activeFormats.strikethrough) && "Text-style"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {textStyleOpen && (
                <div className="absolute top-[38px] left-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[130px] text-xs font-medium text-slate-700 animate-slide-up">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("bold");
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between ${activeFormats.bold ? "bg-slate-50/50" : ""}`}
                  >
                    <span className="font-serif font-extrabold text-[13px] text-slate-900">Bold</span>
                    {activeFormats.bold && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("italic");
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between ${activeFormats.italic ? "bg-slate-50/50" : ""}`}
                  >
                    <span className="font-serif italic text-[13px] text-slate-850">Italic</span>
                    {activeFormats.italic && <Check className="w-3.5 h-3.5 text-indigo-650 stroke-[2.5]" />}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("underline");
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between ${activeFormats.underline ? "bg-slate-50/50" : ""}`}
                  >
                    <span className="font-serif underline text-[13px] text-slate-850">Underline</span>
                    {activeFormats.underline && <Check className="w-3.5 h-3.5 text-indigo-650 stroke-[2.5]" />}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("strikeThrough");
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between ${activeFormats.strikethrough ? "bg-slate-50/50" : ""}`}
                  >
                    <span className="font-serif line-through text-[13px] text-slate-850">Striked</span>
                    {activeFormats.strikethrough && <Check className="w-3.5 h-3.5 text-indigo-650 stroke-[2.5]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Separator 4 */}
            <div className="w-px h-6 bg-[#EEEEEC] shrink-0 self-center mx-1" />

            {/* Block 5: Align Left, Center, Right (Align Group) */}
            {/* Desktop version (Individual buttons) */}
            <div className="hidden md:flex items-center px-1.5 gap-0.5 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("justifyLeft")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.justifyLeft && !activeFormats.justifyCenter && !activeFormats.justifyRight
                    ? "bg-slate-100 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("justifyCenter")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.justifyCenter
                    ? "bg-slate-100 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("justifyRight")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.justifyRight
                    ? "bg-slate-100 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile/Phone version ("Align" combo box dropdown) */}
            <div className="relative h-full flex items-center px-0.5 md:hidden shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setAlignOpen(!alignOpen);
                  setTextStyleOpen(false);
                  setBlockTypeOpen(false);
                  setFontSizeOpen(false);
                  setColorPickerOpen(false);
                  setHighlightPickerOpen(false);
                }}
                className={`flex items-center gap-1 px-2 py-1 hover:bg-slate-50 active:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition cursor-pointer min-w-[76px] justify-between h-8 border ${
                  activeFormats.justifyCenter || activeFormats.justifyRight
                    ? "border-indigo-200 bg-indigo-50/40 text-indigo-700"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex items-center gap-1">
                  {activeFormats.justifyCenter && <AlignCenter className="w-3 h-3 text-indigo-600" />}
                  {activeFormats.justifyRight && <AlignRight className="w-3 h-3 text-indigo-600" />}
                  {!activeFormats.justifyCenter && !activeFormats.justifyRight && <AlignLeft className="w-3 h-3 text-indigo-650" />}
                  <span>Align</span>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {alignOpen && (
                <div className="absolute top-[38px] left-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px] text-xs font-medium text-slate-700 animate-slide-up">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("justifyLeft");
                      setAlignOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 ${
                      activeFormats.justifyLeft && !activeFormats.justifyCenter && !activeFormats.justifyRight ? "bg-slate-50 text-indigo-650" : ""
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5 text-slate-600" />
                    <span>Align Left</span>
                    {activeFormats.justifyLeft && !activeFormats.justifyCenter && !activeFormats.justifyRight && <Check className="ml-auto w-3.5 h-3.5 text-indigo-650" />}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("justifyCenter");
                      setAlignOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 ${
                      activeFormats.justifyCenter ? "bg-slate-50 text-indigo-650" : ""
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5 text-slate-600" />
                    <span>Align Center</span>
                    {activeFormats.justifyCenter && <Check className="ml-auto w-3.5 h-3.5 text-indigo-650" />}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("justifyRight");
                      setAlignOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 ${
                      activeFormats.justifyRight ? "bg-slate-50 text-indigo-650" : ""
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>Align Right</span>
                    {activeFormats.justifyRight && <Check className="ml-auto w-3.5 h-3.5 text-indigo-650" />}
                  </button>
                </div>
              )}
            </div>

            {/* Separator 5 */}
            <div className="w-px h-6 bg-[#EEEEEC] shrink-0 self-center mx-1" />

            {/* Block 6: Bullet list / Numbered list */}
            <div className="flex items-center px-1.5 gap-0.5 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("insertUnorderedList")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.unorderedList
                    ? "bg-slate-100 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format("insertOrderedList")}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  activeFormats.orderedList
                    ? "bg-slate-100 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Separator 6 */}
            <div className="w-px h-6 bg-[#EEEEEC] shrink-0 self-center mx-1" />

            {/* Block 7: Highlight Picker */}
            <div className="relative h-full flex items-center px-1.5 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setHighlightPickerOpen(!highlightPickerOpen);
                  setBlockTypeOpen(false);
                  setFontSizeOpen(false);
                  setColorPickerOpen(false);
                  setTextStyleOpen(false);
                  setAlignOpen(false);
                }}
                className={`w-7 h-7 flex flex-col items-center justify-center rounded transition relative cursor-pointer ${
                  activeHighlight !== "transparent" ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"
                }`}
                title="Highlight"
              >
                <Highlighter className="w-3.5 h-3.5" />
                {activeHighlight !== "transparent" && (
                  <div 
                    className="absolute bottom-1 w-3 h-0.5 rounded-full animate-pulse" 
                    style={{ backgroundColor: activeHighlight }}
                  />
                )}
              </button>

              {highlightPickerOpen && (
                <div className="absolute top-[38px] right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 w-[140px] text-xs font-semibold">
                  <div className="flex justify-between items-center gap-1.5">
                    {[
                      { value: "#FEF08A", label: "Yellow" },
                      { value: "#BBF7D0", label: "Green" },
                      { value: "#FBCFE8", label: "Pink" },
                    ].map((hp) => {
                      const isCurrent = activeHighlight.toLowerCase() === hp.value.toLowerCase();
                      return (
                        <button
                          key={hp.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            format("backColor", hp.value);
                            setActiveHighlight(hp.value);
                            setHighlightPickerOpen(false);
                          }}
                          className="w-5 h-5 rounded border border-slate-150 flex items-center justify-center transition hover:scale-105 cursor-pointer relative"
                          style={{ backgroundColor: hp.value }}
                          title={hp.label}
                        >
                          {isCurrent && (
                            <Check className="w-3 h-3 text-slate-800 stroke-[3.5]" />
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("backColor", "transparent");
                        setActiveHighlight("transparent");
                        setHighlightPickerOpen(false);
                      }}
                      className="w-5 h-5 rounded border border-slate-250 flex items-center justify-center hover:bg-slate-100 cursor-pointer text-[10px] font-bold text-slate-500"
                      title="No Highlight"
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Editable Editor Body */}
          <div 
            className="flex-1 p-4 overflow-y-auto outline-none min-h-0 bg-white" 
            onClick={handleEditorClick}
          >
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onBlur={handleInput}
              className="min-h-full outline-none rich-editor-content prose max-w-none text-left select-text p-1 leading-relaxed"
              style={{
                fontFamily: "'Fira Sans Condensed', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#20124D",
              }}
              placeholder="Start typing your formatted linguist notes here (Bold, Color, Lists)..."
            />
          </div>
        </div>
      ) : (
        /* Read Mode Layout */
        <div className="flex-1 flex flex-col bg-white min-h-0">
          <div className="flex-1 p-5 overflow-y-auto text-left leading-relaxed">
            {htmlContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="rich-editor-content prose max-w-none select-text"
                style={{
                  fontFamily: "'Fira Sans Condensed', sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#20124D",
                }}
              />
            ) : (
              <div 
                className="text-center py-20 text-slate-400 italic select-none"
                style={{ fontFamily: "'Fira Sans Condensed', sans-serif", fontSize: "12px" }}
              >
                No notes created yet. Click edit at the top to add formatted linguist points!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
