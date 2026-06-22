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
  Strikethrough,
  MoreHorizontal,
  Undo,
  Redo
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
  "36": "7",
  "48": "7",
  "60": "7",
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

  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [popupLeft, setPopupLeft] = useState<number>(0);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const savedSelectionRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          savedSelectionRangeRef.current = range.cloneRange();
        }
      }
    } catch (e) {
      // safe fallback
    }
  };

  const restoreSelection = () => {
    try {
      if (!editorRef.current) return;
      editorRef.current.focus();
      if (savedSelectionRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRangeRef.current);
        }
      }
    } catch (e) {
      // safe fallback
    }
  };

  const openPopup = (
    e: React.MouseEvent<HTMLButtonElement>,
    popupSetter: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
    popupWidth: number = 100
  ) => {
    setFontSizeOpen(false);
    setColorPickerOpen(false);
    setHighlightPickerOpen(false);
    setMoreOpen(false);

    if (!isOpen) {
      if (toolbarRef.current) {
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        let left = buttonRect.left - toolbarRect.left;
        
        // Ensure the popup doesn't spill past the right border of the toolbar
        if (left + popupWidth > toolbarRect.width) {
          left = Math.max(8, toolbarRect.width - popupWidth - 8);
        }
        setPopupLeft(left);
      }
      popupSetter(true);
    }
  };

  const updateActiveStates = () => {
    try {
      const fbVal = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
      
      let mappedFontSize = "14"; // default to 14
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (editorRef.current && editorRef.current.contains(node)) {
          if (node && node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode || node;
          }
          if (node && node instanceof Element) {
            const computedFS = window.getComputedStyle(node).fontSize;
            if (computedFS) {
              const fsFloat = parseFloat(computedFS);
              if (!isNaN(fsFloat)) {
                const rounded = Math.round(fsFloat);
                const PREDEFINED_SIZES = [10, 12, 14, 16, 18, 20, 24, 36, 48, 60];
                // Find closest index
                let closest = PREDEFINED_SIZES[2]; // default to 14
                let minDiff = Math.abs(rounded - closest);
                for (const size of PREDEFINED_SIZES) {
                  const diff = Math.abs(rounded - size);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closest = size;
                  }
                }
                mappedFontSize = String(closest);
              }
            }
          }
        }
      }

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
      saveSelection();
      updateActiveStates();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Synchronize standard copy and cut keyboard shortcuts / browser actions to local clipboard fallback
  useEffect(() => {
    const handleCopyEvent = (e: ClipboardEvent) => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const text = sel.toString();
        let html = "";
        if (sel.rangeCount > 0) {
          try {
            const range = sel.getRangeAt(0);
            const container = document.createElement("div");
            container.appendChild(range.cloneContents());
            html = container.innerHTML;
          } catch (err) {
            console.warn("Failed to get selected HTML in event", err);
          }
        }
        (window as any).appClipboardText = text;
        (window as any).appClipboardHtml = html || text;
      }
    };

    document.addEventListener("copy", handleCopyEvent);
    document.addEventListener("cut", handleCopyEvent);
    return () => {
      document.removeEventListener("copy", handleCopyEvent);
      document.removeEventListener("cut", handleCopyEvent);
    };
  }, []);

  // Helper to check if notes HTML is empty
  const isHtmlEmpty = (html: string | null | undefined): boolean => {
    if (!html) return true;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = (tempDiv.textContent || tempDiv.innerText || "").trim();
    if (text === "Write down something...") return true;
    const hasMediaOrStructure = tempDiv.querySelector("img, table, iframe, hr, li") !== null;
    return text === "" && !hasMediaOrStructure;
  };

  // Load notes initially
  useEffect(() => {
    // For each new article, Points to note currently pre-fills some sample notes; remove that behavior.
    setHtmlContent(article.notes || "");
  }, [article.id, article.notes]);

  // Sync internal state into editable div ref if edited state changes or mounts
  useEffect(() => {
    if (editorRef.current && isEditMode) {
      if (isHtmlEmpty(htmlContent)) {
        editorRef.current.innerHTML = "";
      } else {
        editorRef.current.innerHTML = htmlContent;
      }
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
      let finalHtml = htmlContent;
      if (isHtmlEmpty(finalHtml)) {
        finalHtml = "";
      }
      onSaveNotes(finalHtml);
    }
    prevEditModeRef.current = isEditMode;
  }, [isEditMode, htmlContent, onSaveNotes]);

  // Execute standard text formatting command
  const format = (command: string, value: string = "") => {
    restoreSelection();
    try {
      try {
        document.execCommand("styleWithCSS", false, "false");
      } catch (e) {
        // safe fallback
      }
      if (command === "formatBlock") {
        const success = document.execCommand(command, false, value);
        if (!success) {
          const stripped = value.replace(/[<>]/g, "");
          document.execCommand(command, false, stripped);
        }
      } else if (command === "fontSize") {
        const sz = value; // e.g. "36", "14", etc.
        const standardSize = SIZE_MAP[sz] || "7";
        document.execCommand("fontSize", false, standardSize);
        if (editorRef.current) {
          const fontElements = editorRef.current.querySelectorAll(`font[size="${standardSize}"]`);
          fontElements.forEach((el) => {
            el.removeAttribute("size");
            (el as HTMLElement).style.fontSize = `${sz}px`;
            el.setAttribute("data-custom-size", sz);
          });
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
    if (isHtmlEmpty(finalHtml)) {
      finalHtml = "";
    }
    onSaveNotes(finalHtml);
    setIsEditMode(false);
  };

  const handleCut = async () => {
    restoreSelection();
    try {
      const sel = window.getSelection();
      let selectedText = "";
      let selectedHtml = "";
      if (sel && !sel.isCollapsed) {
        selectedText = sel.toString();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const container = document.createElement("div");
          container.appendChild(range.cloneContents());
          selectedHtml = container.innerHTML;
        }
      }

      if (selectedText) {
        (window as any).appClipboardText = selectedText;
        (window as any).appClipboardHtml = selectedHtml || selectedText;
      }

      const success = document.execCommand("cut");
      if (!success && selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (e) {
          // ignore
        }
        document.execCommand("delete");
      }
    } catch (err) {
      console.warn("Cut failed", err);
    }
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    updateActiveStates();
  };

  const handleCopy = async () => {
    restoreSelection();
    try {
      const sel = window.getSelection();
      let selectedText = "";
      let selectedHtml = "";
      if (sel && !sel.isCollapsed) {
        selectedText = sel.toString();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const container = document.createElement("div");
          container.appendChild(range.cloneContents());
          selectedHtml = container.innerHTML;
        }
      }

      if (selectedText) {
        (window as any).appClipboardText = selectedText;
        (window as any).appClipboardHtml = selectedHtml || selectedText;
      }

      const success = document.execCommand("copy");
      if (!success && selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  const handlePaste = async () => {
    restoreSelection();
    let pasted = false;

    // 1. Try modern rich text clipboard API (navigator.clipboard.read)
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        let htmlText = "";
        let plainText = "";

        for (const item of items) {
          if (item.types.includes("text/html")) {
            const blob = await item.getType("text/html");
            htmlText = await blob.text();
          }
          if (item.types.includes("text/plain")) {
            const blob = await item.getType("text/plain");
            plainText = await blob.text();
          }
        }

        if (htmlText) {
          document.execCommand("insertHTML", false, htmlText);
          pasted = true;
        } else if (plainText) {
          document.execCommand("insertText", false, plainText);
          pasted = true;
        }
      }
    } catch (err) {
      console.warn("Navigator clipboard read failed, using local/fallback", err);
    }

    // 2. Try rich local clipboard fallback if system rich paste didn't succeed
    if (!pasted) {
      const html = (window as any).appClipboardHtml;
      if (html) {
        try {
          document.execCommand("insertHTML", false, html);
          pasted = true;
        } catch (e) {
          console.warn("InsertHTML fallback failed", e);
        }
      }
    }

    // 3. Try plain text clipboard APIs (readText)
    if (!pasted) {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            document.execCommand("insertText", false, text);
            pasted = true;
          }
        }
      } catch (err) {
        console.warn("Navigator clipboard readText failed", err);
      }
    }

    // 4. Try plain text local fallback
    if (!pasted) {
      const text = (window as any).appClipboardText;
      if (text) {
        document.execCommand("insertText", false, text);
        pasted = true;
      }
    }

    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    updateActiveStates();
  };

  const handlePasteNoFormat = async () => {
    restoreSelection();
    let pasted = false;

    // 1. Try reading from navigator.clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const plainText = text.replace(/<[^>]*>/g, "");
          document.execCommand("insertText", false, plainText);
          pasted = true;
        }
      }
    } catch (err) {
      console.warn("Navigator clipboard read failed in paste no format", err);
    }

    // 2. Fallback to app-level local clipboard
    if (!pasted) {
      const text = (window as any).appClipboardText;
      if (text) {
        const plainText = text.replace(/<[^>]*>/g, "");
        document.execCommand("insertText", false, plainText);
        pasted = true;
      }
    }

    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    updateActiveStates();
  };

  const handleEditorClick = () => {
    setFontSizeOpen(false);
    setColorPickerOpen(false);
    setHighlightPickerOpen(false);
    setMoreOpen(false);
    saveSelection();
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
        <div className="flex-1 flex flex-col-reverse min-h-0 bg-white">
          {/* Elegant full-width single-row toolbar placed directly at the bottom of the editor */}
          <div 
            ref={toolbarRef}
            className="bg-[#FDFDFD] border-t border-slate-200 relative shrink-0 select-none z-40 w-full h-11 flex items-center"
          >
            {/* Scrollable button container */}
            <div className="w-full h-full flex items-center justify-start overflow-x-auto scrollbar-none px-3 gap-0.5 md:gap-1.5">
              
              {/* Block 1: Bold, Italic, Underline, Strikethrough (Style Group) - ALWAYS INLINE */}
              <div className="flex items-center px-1 gap-0.5 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => format("bold")}
                  className={`w-7 h-7 flex items-center justify-center rounded transition ${
                    activeFormats.bold
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-700 hover:bg-slate-100/70 cursor-pointer"
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
                      : "text-slate-700 hover:bg-slate-100/70 cursor-pointer"
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
                      : "text-slate-700 hover:bg-slate-100/70 cursor-pointer"
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
                      : "text-slate-700 hover:bg-slate-100/70 cursor-pointer"
                  }`}
                  title="Strikethrough"
                >
                  <span className="font-serif line-through text-[15px] select-none text-slate-850">S</span>
                </button>
              </div>

              {/* Group Divider */}
              <div className="w-px h-5 bg-[#EEEEEC] shrink-0 self-center mx-1" />

              {/* Block 2: Font Size Selector */}
              <div className="relative h-full flex items-center px-1 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => openPopup(e, setFontSizeOpen, fontSizeOpen, 70)}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100/70 active:bg-slate-200/50 rounded text-xs font-semibold text-slate-700 transition cursor-pointer min-w-[50px] justify-between h-8 bg-transparent"
                >
                  <span>{activeFormats.fontSize}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Block 3: Text Color Picker */}
              <div className="relative h-full flex items-center px-1 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => openPopup(e, setColorPickerOpen, colorPickerOpen, 120)}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100/70 active:bg-slate-200/50 rounded text-xs font-semibold text-slate-700 transition cursor-pointer h-8 bg-transparent"
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-200/60 shadow-5xs shrink-0" 
                    style={{ backgroundColor: activeColor }}
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Separator (Desktop only to separate basic text styling from layout items) */}
              <div className="hidden md:block w-px h-5 bg-[#EEEEEC] shrink-0 self-center mx-1" />

              {/* Block 4: Align Left, Center, Right (Align Group) */}
              {/* Desktop version (Individual buttons) */}
              <div className="hidden md:flex items-center px-1.5 gap-0.5 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => format("justifyLeft")}
                  className={`w-7 h-7 flex items-center justify-center rounded transition ${
                    activeFormats.justifyLeft && !activeFormats.justifyCenter && !activeFormats.justifyRight
                      ? "bg-slate-100 text-indigo-650 font-semibold"
                      : "text-slate-650 hover:bg-slate-100/70 cursor-pointer"
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
                      ? "bg-slate-100 text-indigo-655 font-semibold"
                      : "text-slate-650 hover:bg-slate-100/70 cursor-pointer"
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
                      ? "bg-slate-100 text-indigo-655 font-semibold"
                      : "text-slate-650 hover:bg-slate-100/70 cursor-pointer"
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Separator (Desktop only) */}
              <div className="hidden md:block w-px h-5 bg-[#EEEEEC] shrink-0 self-center mx-1" />

              {/* Block 5: Bullet list / Numbered list */}
              {/* Desktop version */}
              <div className="hidden md:flex items-center px-1.5 gap-0.5 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => format("insertUnorderedList")}
                  className={`w-7 h-7 flex items-center justify-center rounded transition ${
                    activeFormats.unorderedList
                      ? "bg-slate-100 text-indigo-655 font-semibold"
                      : "text-slate-650 hover:bg-slate-100/70 cursor-pointer"
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
                      ? "bg-slate-100 text-indigo-655 font-semibold"
                      : "text-slate-650 hover:bg-slate-100/70 cursor-pointer"
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Separator (Desktop only) */}
              <div className="hidden md:block w-px h-5 bg-[#EEEEEC] shrink-0 self-center mx-1" />

              {/* Block 6: Highlight Picker */}
              {/* Desktop version */}
              <div className="hidden md:flex relative h-full flex items-center px-1.5 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => openPopup(e, setHighlightPickerOpen, highlightPickerOpen, 140)}
                  className={`w-7 h-7 flex flex-col items-center justify-center rounded transition relative cursor-pointer ${
                    activeHighlight !== "transparent" ? "bg-amber-50 text-amber-750" : "text-slate-650 hover:bg-slate-100/70"
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
              </div>

              {/* Separator (Desktop only) */}
              <div className="hidden md:block w-px h-5 bg-[#EEEEEC] shrink-0 self-center mx-1" />

              {/* Block 7: Undo & Redo */}
              {/* Desktop version */}
              <div className="hidden md:flex items-center px-1.5 gap-0.5 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => format("undo")}
                  className="w-7 h-7 flex items-center justify-center rounded transition text-slate-650 hover:bg-slate-100/70 cursor-pointer"
                  title="Undo"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => format("redo")}
                  className="w-7 h-7 flex items-center justify-center rounded transition text-slate-650 hover:bg-slate-100/70 cursor-pointer"
                  title="Redo"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
              </div>



              {/* Mobile/Phone version ("..." dropdown grouping Align, List, and Highlight) */}
              <div className="relative h-full flex items-center px-0.5 md:hidden shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => openPopup(e, setMoreOpen, moreOpen, 200)}
                  className="flex items-center justify-center gap-1.5 px-2 py-1 hover:bg-slate-100/70 active:bg-slate-200/50 rounded transition cursor-pointer h-8 text-slate-700 bg-[#FDFDFD]"
                  title="More Formatting"
                >
                  <span className="text-slate-700 font-bold tracking-widest text-[15px] pl-1.5 select-none leading-none pb-1.5">...</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              </div>

            </div>

            {/* Dropdowns placed OUTSIDE the scrollable container, inside the parent relative space, with dynamic left-offset! */}
            {fontSizeOpen && (
              <div 
                style={{ left: `${popupLeft}px` }}
                className="absolute bottom-[44px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[70px] text-xs font-medium text-slate-700 animate-slide-up"
              >
                {["10", "12", "14", "16", "18", "20", "24", "36", "48", "60"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      format("fontSize", sz);
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

            {colorPickerOpen && (
              <div 
                style={{ left: `${popupLeft}px` }}
                className="absolute bottom-[44px] bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 w-[120px] animate-slide-up"
              >
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
                        className="w-5 h-5 rounded-full border border-slate-200/55 flex items-center justify-center transition hover:scale-110 cursor-pointer relative"
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

            {highlightPickerOpen && (
              <div 
                style={{ left: `${popupLeft}px` }}
                className="absolute bottom-[44px] bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 w-[140px] text-xs font-semibold animate-slide-up"
              >
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

            {/* Mobile/Phone "More" grouped popover */}
            {moreOpen && (
              <div 
                style={{ left: `${popupLeft}px` }}
                className="absolute bottom-[44px] bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px] flex flex-col gap-3.5 animate-slide-up"
              >
                {/* Alignment Option Section */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Alignment</div>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-md border border-slate-105">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("justifyLeft");
                      }}
                      className={`flex-1 h-7 flex items-center justify-center rounded text-xs transition ${
                        activeFormats.justifyLeft && !activeFormats.justifyCenter && !activeFormats.justifyRight
                          ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("justifyCenter");
                      }}
                      className={`flex-1 h-7 flex items-center justify-center rounded text-xs transition ${
                        activeFormats.justifyCenter
                          ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("justifyRight");
                      }}
                      className={`flex-1 h-7 flex items-center justify-center rounded text-xs transition ${
                        activeFormats.justifyRight
                          ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Lists Option Section */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">List Style</div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("insertUnorderedList");
                      }}
                      className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md border text-[11px] font-semibold transition ${
                        activeFormats.unorderedList
                          ? "bg-indigo-50/70 border-indigo-250 text-indigo-650"
                          : "border-slate-200 bg-white text-slate-750 hover:bg-slate-55"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Bullet</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("insertOrderedList");
                      }}
                      className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md border text-[11px] font-semibold transition ${
                        activeFormats.orderedList
                          ? "bg-indigo-50/70 border-indigo-250 text-indigo-650"
                          : "border-slate-200 bg-white text-slate-755 hover:bg-slate-55"
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>Numbered</span>
                    </button>
                  </div>
                </div>

                {/* Highlight Option Section */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Highlight</div>
                  <div className="flex justify-between items-center gap-1 border border-slate-200/80 rounded-md p-1 bg-slate-50/60">
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
                          }}
                          className="w-6 h-6 rounded-md border border-slate-300 flex items-center justify-center transition hover:scale-105 cursor-pointer relative shrink-0"
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
                      }}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center hover:bg-slate-100 cursor-pointer text-[10px] font-bold shrink-0 transition ${
                        activeHighlight === "transparent"
                          ? "bg-slate-200 border-slate-300 text-slate-700"
                          : "bg-white border-slate-200 text-slate-400"
                      }`}
                      title="Clear Highlight"
                    >
                      X
                    </button>
                  </div>
                </div>

                {/* Undo / Redo Option Section */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">History</div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("undo");
                      }}
                      className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-slate-750 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Undo className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        format("redo");
                      }}
                      className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-slate-750 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Redo className="w-3.5 h-3.5" />
                      <span>Redo</span>
                    </button>
                  </div>
                </div>


              </div>
            )}

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
                fontSize: "14px",
                fontWeight: 400,
                color: "#20124D",
              }}
              placeholder="Write down something..."
            />
          </div>
        </div>
      ) : (
        /* Read Mode Layout */
        <div 
          className="flex-1 flex flex-col bg-white min-h-0 select-text"
          onDoubleClick={() => setIsEditMode(true)}
          title="Double-click to edit notes"
        >
          <div className="flex-1 p-5 overflow-y-auto text-left leading-relaxed">
            {htmlContent && !isHtmlEmpty(htmlContent) ? (
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="rich-editor-content prose max-w-none select-text"
                style={{
                  fontFamily: "'Fira Sans Condensed', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#20124D",
                }}
              />
            ) : (
              <div 
                className="text-center py-20 text-slate-400 italic select-none"
                style={{ fontFamily: "'Fira Sans Condensed', sans-serif", fontSize: "14px" }}
              >
                Write down something...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
