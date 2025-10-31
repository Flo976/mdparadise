export type FileOrFolderType = 'file' | 'folder';

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

export interface EnhancedSidebarProps {
  files: any[]; // MarkdownFile[] from @/types
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onRefresh: () => void;
  baseDir: string;
}
