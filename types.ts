export enum TabStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  summary: string;
  sources: WebSource[];
}

export interface Tab {
  id: string;
  title: string;
  url: string; // This acts as the search query or "address"
  status: TabStatus;
  content: SearchResult | null;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
}

export interface ProjectFile {
  name: string;
  type: 'file' | 'folder';
  children?: ProjectFile[];
  description?: string;
}