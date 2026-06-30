import React, { useState, useEffect } from 'react';
import { Topic, Article, AccessLog, SubtitleSegment, SyncLog, VocabularyItem } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';

// Local Javascript parser mimicking the Kotlin SubtitleParser.kt code
export const parseSubtitles = (content: string): SubtitleSegment[] => {
  const sanitized = content.trim().replace(/\r\n/g, '\n');
  const isVtt = sanitized.toLowerCase().startsWith('webvtt');
  
  // Custom regexes for subtitle blocks
  const srtRegex = /(\d+)\s*\n(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*\n([\s\S]*?)(?=\n{2,}|\n$|$)/g;
  const vttRegex = /(?:(\d+)\s*\n)?(?:WEBVTT\s*)?(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*\n([\s\S]*?)(?=\n{2,}|\n$|$)/g;
  
  const regex = isVtt ? vttRegex : srtRegex;
  const segments: SubtitleSegment[] = [];
  
  let match;
  let indexCounter = 1;

  const parseTimeToMs = (timeStr: string): number => {
    const parts = timeStr.trim().replace(',', '.').split(':');
    if (parts.length < 3) return 0;
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    
    const secondsParts = parts[2].split('.');
    const seconds = parseInt(secondsParts[0], 10) || 0;
    const msStr = secondsParts[1] ? secondsParts[1].padEnd(3, '0').substring(0, 3) : '0';
    const ms = parseInt(msStr, 10) || 0;
    
    return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + ms;
  };

  while ((match = regex.exec(sanitized)) !== null) {
    try {
      const indexStr = match[1];
      const customIndex = isVtt 
        ? (indexStr ? parseInt(indexStr, 10) : indexCounter++)
        : parseInt(indexStr, 10);
      const startTime = parseTimeToMs(match[2]);
      const endTime = parseTimeToMs(match[3]);
      
      const rawText = match[4].trim();
      const lines = rawText.split('\n');
      const textLines: string[] = [];
      const transLines: string[] = [];
      
      for (const line of lines) {
        if (line.trim().startsWith('##')) {
          transLines.push(line.trim().replace(/^##\s*/, ''));
        } else {
          textLines.push(line);
        }
      }
      
      const text = textLines.join('\n').trim();
      const translation = transLines.length > 0 ? transLines.join('\n').trim() : undefined;
      
      segments.push({
        index: customIndex,
        startTimeMs: startTime,
        endTimeMs: endTime,
        text,
        translation
      });
    } catch (e) {
      // safe bypass individual segment failure
    }
  }

  // Fallback backup if regex parsing matches nothing but contains raw rows
  if (segments.length === 0) {
    const lines = content.split('\n');
    let idx = 1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        const timeParts = lines[i].split('-->');
        const rawText = (lines[i+1] || "").trim();
        const subLines = rawText.split('\n');
        const textLines: string[] = [];
        const transLines: string[] = [];
        for (const line of subLines) {
          if (line.trim().startsWith('##')) {
            transLines.push(line.trim().replace(/^##\s*/, ''));
          } else {
            textLines.push(line);
          }
        }
        const text = textLines.join('\n').trim();
        const translation = transLines.length > 0 ? transLines.join('\n').trim() : undefined;

        segments.push({
          index: idx++,
          startTimeMs: parseTimeToMs(timeParts[0]),
          endTimeMs: parseTimeToMs(timeParts[1] || timeParts[0]),
          text,
          translation
        });
        i++;
      }
    }
  }

  return segments;
};

// Initial Seed Data mirroring standard production setups
const INITIAL_TOPICS: Topic[] = [
  {
    id: 1,
    title: "German for Globetrotters",
    description: "Crucial traveling vocabulary, airport check-ins, hotel dialogues, and navigating public transit across Berlin.",
    createdAt: "2026-06-11 08:30"
  },
  {
    id: 2,
    title: "Modern Business French",
    description: "Professional networking, email phrasing, greeting partners, and casual ordering dialogues at Paris bistros.",
    createdAt: "2026-06-11 08:35"
  }
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: 1,
    topicId: 1,
    title: "Checking Train Schedules (Berlin Hbf)",
    type: 'subtitle',
    content: `1
00:00:01,000 --> 00:00:04,500
Entschuldigung, fährt dieser Zug direkt nach München?
## Excuse me, does this train go directly to Munich?

2
00:00:05,200 --> 00:00:09,100
Nein, Sie müssen in Nürnberg umsteigen.
## No, you have to transfer in Nuremberg.

3
00:00:10,000 --> 00:00:13,800
Ach so! Und auf welchem Gleis fährt er ab?
## Ah, I see! And which platform does it depart from?

4
00:00:14,200 --> 00:00:18,500
Gleis sieben. Der Anschlusszug wartet bereits.
## Platform seven. The connection train is already waiting.`,
    audioUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    openCount: 3,
    createdAt: "2026-06-11 08:40",
    vocabulary: [
      { id: "v1-1", word: "Entschuldigung", definition: "Excuse me / Sorry", exampleSentence: "Entschuldigung, wo ist der Bahnhof?" },
      { id: "v1-2", word: "der Zug", definition: "the train", exampleSentence: "Der Zug kommt pünktlich an." },
      { id: "v1-3", word: "umsteigen", definition: "to transfer / change trains", exampleSentence: "Ich muss in Köln umsteigen." },
      { id: "v1-4", word: "das Gleis", definition: "the platform / track", exampleSentence: "Der Zug fährt von Gleis 4 ab." },
      { id: "v1-5", word: "der Anschlusszug", definition: "the connecting train", exampleSentence: "Der Anschlusszug hat leider Verspätung." }
    ]
  },
  {
    id: 2,
    topicId: 2,
    title: "Ordering Lunch at Cafe de Flore",
    type: 'subtitle',
    content: `WEBVTT

1
00:00:01.200 --> 00:00:04.500
Bonjour! Serait-il possible de voir la carte?
## Good afternoon! Would it be possible to see the menu?

2
00:00:05.100 --> 00:00:08.800
Bien sûr, monsieur. Voici la carte du jour.
## Of course, sir. Here is today's menu.

3
00:00:09.500 --> 00:00:14.200
Je vais prendre un croque-monsieur et une carafe d'eau.
## I will have a croque-monsieur and a jug of tap water.`,
    audioUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
    openCount: 1,
    createdAt: "2026-06-11 08:41",
    vocabulary: [
      { id: "v2-1", word: "la carte", definition: "the menu", exampleSentence: "Apportez-nous la carte, s'il vous plaît." },
      { id: "v2-2", word: "prendre", definition: "to take / to order / to have (food/drink)", exampleSentence: "Je vais prendre un café." },
      { id: "v2-3", word: "une carafe d'eau", definition: "a jug of tap water (free in France)", exampleSentence: "Une carafe d'eau, s'il vous plaît." },
      { id: "v2-4", word: "bien sûr", definition: "of course / certainly", exampleSentence: "Oui, bien sûr !" }
    ]
  },
  {
    id: 3,
    topicId: 1,
    title: "Overview of German Accusative Case",
    type: 'subtitle',
    content: `1
00:00:01,000 --> 00:00:06,000
The accusative case in German is used for direct objects.

2
00:00:07,000 --> 00:00:13,000
For example: "Ich habe einen Hund" (I have a dog). "einen Hund" is in the accusative case.`,
    audioUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
    openCount: 2,
    createdAt: "2026-06-11 08:42",
    vocabulary: [
      { id: "v3-1", word: "der Hund", definition: "the dog (masculine)", exampleSentence: "Ich sehe den Hund." },
      { id: "v3-2", word: "einen", definition: "a (masculine accusative singular article)", exampleSentence: "Hast du einen Bruder?" }
    ]
  }
];

const INITIAL_LOGS: AccessLog[] = [
  { id: 1, articleId: 1, timestamp: "2026-06-11 08:40:02" },
  { id: 2, articleId: 2, timestamp: "2026-06-11 08:41:15" },
  { id: 3, articleId: 3, timestamp: "2026-06-11 08:42:01" }
];

export const formatDateToYYYYMMDD = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const formatTimestamp = (date: Date): string => {
  const dateStr = formatDateToYYYYMMDD(date);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dateStr} ${hh}:${mm}:${ss}`;
};

export default function App() {
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const cached = localStorage.getItem("vdb_topics");
      return cached ? JSON.parse(cached) : INITIAL_TOPICS;
    } catch {
      return INITIAL_TOPICS;
    }
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const cached = localStorage.getItem("vdb_articles");
      return cached ? JSON.parse(cached) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => {
    try {
      const cached = localStorage.getItem("vdb_access_logs");
      return cached ? JSON.parse(cached) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [syncHistory, setSyncHistory] = useState<SyncLog[]>(() => {
    try {
      const cached = localStorage.getItem("vdb_sync_history");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'app' | 'database' | 'parser' | 'sync' | 'code'>('app');

  // Reactively synchronize to localStorage whenever state changes
  useEffect(() => {
    try { localStorage.setItem("vdb_topics", JSON.stringify(topics)); } catch (e) { console.error(e); }
  }, [topics]);

  useEffect(() => {
    try { localStorage.setItem("vdb_articles", JSON.stringify(articles)); } catch (e) { console.error(e); }
  }, [articles]);

  useEffect(() => {
    try { localStorage.setItem("vdb_access_logs", JSON.stringify(accessLogs)); } catch (e) { console.error(e); }
  }, [accessLogs]);

  useEffect(() => {
    try { localStorage.setItem("vdb_sync_history", JSON.stringify(syncHistory)); } catch (e) { console.error(e); }
  }, [syncHistory]);

  // Triggered when an article is opened inside the Simulated Phone UI
  const handleOpenArticle = (articleId: number) => {
    // 1. Log transaction
    const newLog: AccessLog = {
      id: accessLogs.length + 1,
      articleId,
      timestamp: formatTimestamp(new Date())
    };
    setAccessLogs(prev => [...prev, newLog]);

    // 2. Increment article open count Reactively
    setArticles(prev => prev.map(art => {
      if (art.id === articleId) {
        return { ...art, openCount: art.openCount + 1 };
      }
      return art;
    }));
  };

  const handleAddTopic = (title: string, desc: string) => {
    const newId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
    const newTopic: Topic = {
      id: newId,
      title,
      description: desc,
      createdAt: formatDateToYYYYMMDD(new Date())
    };
    setTopics(prev => [...prev, newTopic]);
  };

  const handleUpdateTopic = (id: number, title: string, description: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, title, description };
      }
      return t;
    }));
  };

  const handleDeleteTopic = (id: number) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const handleAddArticle = (topicId: number, title: string, type: 'subtitle', content: string, imageUrl?: string, audioUrl?: string) => {
    const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    const newArt: Article = {
      id: newId,
      topicId,
      title,
      type,
      content,
      imageUrl,
      audioUrl: audioUrl || '',
      openCount: 0,
      createdAt: formatDateToYYYYMMDD(new Date())
    };
    setArticles(prev => [...prev, newArt]);
  };

  const handleUpdateArticle = (id: number, title: string, type: 'subtitle', content: string, imageUrl?: string, audioUrl?: string, notes?: string) => {
    setArticles(prev => prev.map(art => {
      if (art.id === id) {
        return { ...art, title, type, content, imageUrl, audioUrl, notes: notes !== undefined ? notes : art.notes };
      }
      return art;
    }));
  };

  const handleUpdateVocabulary = (articleId: number, vocabulary: VocabularyItem[]) => {
    setArticles(prev => prev.map(art => {
      if (art.id === articleId) {
        return { ...art, vocabulary };
      }
      return art;
    }));
  };

  const handleDeleteArticle = (id: number) => {
    setArticles(prev => prev.filter(art => art.id !== id));
  };

  const handleToggleMarkArticle = (id: number) => {
    setArticles(prev => prev.map(art => {
      if (art.id === id) {
        return { ...art, marked: !art.marked };
      }
      return art;
    }));
  };

  const handleClearDb = () => {
    setTopics([]);
    setArticles([]);
    setAccessLogs([]);
  };

  const handleImportData = (newTopics: Topic[], newArticles: Article[], newAccessLogs: AccessLog[]) => {
    setTopics(newTopics);
    setArticles(newArticles);
    setAccessLogs(newAccessLogs);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500/10 selection:text-indigo-900">
      <PhoneSimulator 
        topics={topics}
        articles={articles}
        accessLogs={accessLogs}
        onOpenArticle={handleOpenArticle}
        subtitleParser={parseSubtitles}
        onUpdateArticle={handleUpdateArticle}
        onAddArticle={handleAddArticle}
        onDeleteArticle={handleDeleteArticle}
        onUpdateVocabulary={handleUpdateVocabulary}
        onToggleMarkArticle={handleToggleMarkArticle}
        onAddTopic={handleAddTopic}
        onUpdateTopic={handleUpdateTopic}
        onDeleteTopic={handleDeleteTopic}
        onImportData={handleImportData}
      />
    </div>
  );
}
