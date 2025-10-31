"use client";

import { useState, useMemo } from "react";
import { FileText, Folder, Search, Clock, Edit2, Trash2, FilePlus, FolderPlus, List, TreePine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FileTreeView } from "./file-tree-view";
import type { MarkdownFile } from "@/types";

interface FileSidebarProps {
  files: MarkdownFile[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  baseDir: string;
  onFileRename: (filepath: string, newName: string) => void;
  onFileDelete: (filepath: string) => void;
  onFileCreate: (name: string) => void;
  onFolderCreate: (name: string) => void;
  onFileMove?: (sourcePath: string, destinationPath: string) => void;
}

export function FileSidebar({ files, currentFile, onFileSelect, baseDir, onFileRename, onFileDelete, onFileCreate, onFolderCreate, onFileMove }: FileSidebarProps) {
  const [search, setSearch] = useState("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFileOrFolderName, setNewFileOrFolderName] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

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
      .filter((file) => file.type !== 'directory')
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 3);
  }, [files]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="MDParadise" className="h-[120px] w-[120px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* Action buttons */}
          <div className="px-4 py-2 flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setNewFileOrFolderName("");
                      setShowFileDialog(true);
                    }}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Fichier
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer un nouveau fichier markdown</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setNewFileOrFolderName("");
                      setShowFolderDialog(true);
                    }}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Dossier
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer un nouveau dossier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode(viewMode === "tree" ? "list" : "tree")}
                  >
                    {viewMode === "tree" ? (
                      <List className="h-4 w-4" />
                    ) : (
                      <TreePine className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{viewMode === "tree" ? "Vue liste" : "Vue arborescence"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="h-px bg-border mx-4" />


          {/* Recent Files Section */}
          {!search && recentFiles.length > 0 && (
            <div className="px-4 py-2">
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

          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-180px)]">
              {viewMode === "tree" ? (
                <div className="px-2">
                  <FileTreeView
                    files={filteredFiles}
                    currentFile={currentFile}
                    onFileSelect={onFileSelect}
                    onFileRename={onFileRename}
                    onFileDelete={onFileDelete}
                    onFileMove={onFileMove}
                  />
                </div>
              ) : (
                <SidebarMenu>
                  {filteredFiles.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {search ? "Aucun fichier trouvé" : "Aucun fichier markdown"}
                    </div>
                  ) : (
                    filteredFiles.map((file) => (
                      <SidebarMenuItem key={file.path}>
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => onFileSelect(file.path)}
                              isActive={currentFile === file.path}
                              className="w-full"
                            >
                              <FileText className="h-4 w-4" />
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
                                  <span className="font-medium truncate w-full">
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
                              <Badge variant="secondary" className="text-xs">
                                {formatFileSize(file.size)}
                              </Badge>
                            </SidebarMenuButton>
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
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Dialog for creating a new file */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau fichier</DialogTitle>
            <DialogDescription>
              Entrez le nom du nouveau fichier markdown. L'extension .md sera ajoutée automatiquement si nécessaire.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="mon-fichier"
              value={newFileOrFolderName}
              onChange={(e) => setNewFileOrFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFileOrFolderName.trim()) {
                  const name = newFileOrFolderName.trim();
                  onFileCreate(name.endsWith('.md') ? name : `${name}.md`);
                  setShowFileDialog(false);
                  setNewFileOrFolderName("");
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFileDialog(false);
                setNewFileOrFolderName("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (newFileOrFolderName.trim()) {
                  const name = newFileOrFolderName.trim();
                  onFileCreate(name.endsWith('.md') ? name : `${name}.md`);
                  setShowFileDialog(false);
                  setNewFileOrFolderName("");
                }
              }}
              disabled={!newFileOrFolderName.trim()}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating a new folder */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
            <DialogDescription>
              Entrez le nom du nouveau dossier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="mon-dossier"
              value={newFileOrFolderName}
              onChange={(e) => setNewFileOrFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFileOrFolderName.trim()) {
                  onFolderCreate(newFileOrFolderName.trim());
                  setShowFolderDialog(false);
                  setNewFileOrFolderName("");
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFolderDialog(false);
                setNewFileOrFolderName("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (newFileOrFolderName.trim()) {
                  onFolderCreate(newFileOrFolderName.trim());
                  setShowFolderDialog(false);
                  setNewFileOrFolderName("");
                }
              }}
              disabled={!newFileOrFolderName.trim()}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
