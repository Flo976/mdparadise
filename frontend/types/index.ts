export interface MarkdownFile {
  name: string;
  path: string;
  dir: string;
  size: number;
  mtime: number; // modification time in milliseconds
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

// ==================== File Operations ====================

export interface CreateFileRequest {
  path: string;
  content?: string;
}

export interface RenameFileRequest {
  oldPath: string;
  newPath: string;
}

export interface DeleteFileRequest {
  path: string;
}

export interface FileOperationResponse {
  success: boolean;
  message?: string;
  error?: string;
  newPath?: string;
}

// ==================== Folder Operations ====================

export interface CreateFolderRequest {
  path: string;
}

export interface RenameFolderRequest {
  oldPath: string;
  newPath: string;
}

export interface DeleteFolderRequest {
  path: string;
}

export interface FolderOperationResponse {
  success: boolean;
  message?: string;
  error?: string;
  newPath?: string;
  filesDeleted?: number;
  foldersDeleted?: number;
}

export interface FolderInfo {
  path: string;
  name: string;
  filesCount: number;
  foldersCount: number;
}

// ==================== Common Types ====================

export type FileOrFolderType = 'file' | 'folder';

export interface FileSystemItem {
  name: string;
  path: string;
  type: FileOrFolderType;
  size?: number;
  mtime?: number;
}
