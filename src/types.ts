export interface Topic {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  exampleSentence?: string;
}

export interface Article {
  id: number;
  topicId: number;
  title: string;
  type: 'subtitle';
  content: string; // Plain text or SRT/VTT content
  audioUrl?: string; // Simulated audio source
  imageUrl?: string; // Cover and thumbnail image source
  openCount: number;
  createdAt: string;
  marked?: boolean;
  vocabulary?: VocabularyItem[];
  notes?: string;
}

export interface AccessLog {
  id: number;
  articleId: number;
  timestamp: string;
}

export interface SubtitleSegment {
  index: number;
  startTimeMs: number;
  endTimeMs: number;
  text: string;
  translation?: string;
}

export interface SyncLog {
  id: string;
  direction: 'upload' | 'download';
  status: 'running' | 'success' | 'failed';
  timestamp: string;
  details: string;
}
