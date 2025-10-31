export interface MarkdownFile {
  name: string;
  path: string;
  dir: string;
  size: number;
  mtime: number; // modification time in milliseconds
  type?: 'file' | 'directory'; // type of entry (optional for backward compatibility)
}

export interface FilesResponse {
  success: boolean;
  files: MarkdownFile[];
  base_dir: string;
  error?: string;
}

export interface FileContentResponse {
  success: boolean;
  content: string;
  html: string;
  path: string;
  error?: string;
}

export interface SaveFileResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SearchMatch {
  lineNumber: number;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface SearchResult {
  file: {
    name: string;
    path: string;
    dir: string;
  };
  matches: SearchMatch[];
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  query: string;
  count: number;
  error?: string;
}
