"use client";

import { useState, useMemo } from "react";
import { FileText, Folder, Search, Clock, Edit2, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { MarkdownFile } from "@/types";

interface FileListContentProps {
  files: MarkdownFile[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  baseDir: string;
  onFileRename: (filepath: string, newName: string) => void;
  onFileDelete: (filepath: string) => void;
}

export function FileListContent({ files, currentFile, onFileSelect, baseDir, onFileRename, onFileDelete }: FileListContentProps) {
  const [search, setSearch] = useState("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const filteredFiles = useMemo(() => {
    if (!search) return files;
    const searchLower = search.toLowerCase();
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchLower) ||
        file.path.toLowerCase().includes(searchLower)
    );
  }, [files, search]);

  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 3);
  }, [files]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="MDParadise" className="h-[120px] w-[120px]" />
        </div>
      </div>

      {/* Recent Files Section */}
      {!search && recentFiles.length > 0 && (
        <div className="px-4 py-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            Fichiers récents
          </div>
          <div className="space-y-1">
            {recentFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => onFileSelect(file.path)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors ${
                  currentFile === file.path ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="h-px bg-border my-2" />
        </div>
      )}

      {/* Files List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-2">
          {filteredFiles.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? "Aucun fichier trouvé" : "Aucun fichier markdown"}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <ContextMenu key={file.path}>
                <ContextMenuTrigger asChild>
                  <button
                    onClick={() => onFileSelect(file.path)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-accent ${
                      currentFile === file.path ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        {renamingFile === file.path ? (
                          <Input
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onFileRename(file.path, newFileName);
                                setRenamingFile(null);
                              } else if (e.key === 'Escape') {
                                setRenamingFile(null);
                              }
                            }}
                            onBlur={() => setRenamingFile(null)}
                            autoFocus
                            className="h-6 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium truncate w-full text-sm">
                            {file.name}
                          </span>
                        )}
                        {file.dir !== "." && (
                          <span className="text-xs text-muted-foreground truncate w-full flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {file.dir}
                          </span>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem
                    onClick={() => {
                      setRenamingFile(file.path);
                      setNewFileName(file.name);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Renommer
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer "${file.name}" ?`)) {
                        onFileDelete(file.path);
                      }
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
