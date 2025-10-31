"use client";

import { useState, useMemo } from "react";
import { FileText, Folder, Search, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { FileContextMenu } from "./file-context-menu";
import { FileTree } from "./file-tree";
import { apiClient } from "@/lib/api/client";
import { buildFileTree } from "@/lib/tree-utils";
import type { MarkdownFile } from "@/types";

interface FileSidebarProps {
  files: MarkdownFile[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onRefresh: () => void;
  baseDir: string;
}

export function FileSidebar({ files, currentFile, onFileSelect, onRefresh, baseDir }: FileSidebarProps) {
  const [search, setSearch] = useState("");

  // CRUD Handlers
  const handleCreateFile = async (filepath: string) => {
    await apiClient.createFile(filepath, "# New File\n\nStart writing...");
    onRefresh();
  };

  const handleCreateFolder = async (folderpath: string) => {
    await apiClient.createFolder(folderpath);
    onRefresh();
  };

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

  const fileTree = useMemo(() => {
    return buildFileTree(search ? filteredFiles : files);
  }, [files, filteredFiles, search]);

  // Get current file info for breadcrumb
  const currentFileInfo = useMemo(() => {
    if (!currentFile) return null;
    return files.find(f => f.path === currentFile);
  }, [currentFile, files]);

  // Unified handlers for both file and folder operations
  const handleRename = async (oldPath: string, newPath: string) => {
    const isFolder = !oldPath.includes('.md') || files.some(f => f.path.startsWith(oldPath + '/'));
    if (isFolder) {
      await apiClient.renameFolder(oldPath, newPath);
    } else {
      await apiClient.renameFile(oldPath, newPath);
    }
    if (currentFile === oldPath) {
      onFileSelect(newPath);
    }
    onRefresh();
  };

  const handleDelete = async (path: string) => {
    const isFolder = !path.includes('.md') || files.some(f => f.path.startsWith(path + '/'));
    if (isFolder) {
      await apiClient.deleteFolder(path);
    } else {
      await apiClient.deleteFile(path);
    }
    if (currentFile === path) {
      onFileSelect("");
    }
    onRefresh();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MDParadise" className="h-8 w-8" />
            <h2 className="text-lg font-semibold">MDParadise</h2>
          </div>
          <p className="text-xs text-muted-foreground truncate" title={baseDir}>
            {baseDir}
          </p>

          {/* Breadcrumb for current file */}
          {currentFileInfo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/50 rounded-md px-2 py-1.5">
              {currentFileInfo.dir !== "." && (
                <>
                  <Folder className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{currentFileInfo.dir}</span>
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                </>
              )}
              <FileText className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium truncate">{currentFileInfo.name}</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </SidebarGroupLabel>

          {/* Recent Files Section */}
          {!search && recentFiles.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                Recent Files
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
            <ScrollArea className="h-[calc(100vh-250px)]">
              {filteredFiles.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {search ? "No files found" : "No markdown files"}
                </div>
              ) : (
                <div className="px-2 py-2">
                  <FileTree
                    nodes={fileTree}
                    currentFile={currentFile}
                    onFileSelect={onFileSelect}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onCreateFile={handleCreateFile}
                    onCreateFolder={handleCreateFolder}
                  />
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
