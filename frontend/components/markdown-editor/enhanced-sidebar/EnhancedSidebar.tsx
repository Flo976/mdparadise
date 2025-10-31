"use client";

import { useState, useMemo } from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarRecentFiles } from "./SidebarRecentFiles";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarFileTree } from "./SidebarFileTree";
import { apiClient } from "@/lib/api/client";
import { buildFileTree } from "@/lib/tree-utils";
import type { MarkdownFile } from "@/types";
import type { EnhancedSidebarProps } from "./types";

export function EnhancedSidebar({
  files,
  currentFile,
  onFileSelect,
  onRefresh,
  baseDir,
}: EnhancedSidebarProps) {
  const [search, setSearch] = useState("");

  // Compute recent files (3 most recently modified)
  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 3);
  }, [files]);

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!search) return files;
    const searchLower = search.toLowerCase();
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchLower) ||
        file.path.toLowerCase().includes(searchLower)
    );
  }, [files, search]);

  // Build file tree
  const fileTree = useMemo(() => {
    return buildFileTree(search ? filteredFiles : files);
  }, [files, filteredFiles, search]);

  // CRUD Handlers
  const handleCreateFile = async (filepath: string) => {
    await apiClient.createFile(filepath, "# New File\n\nStart writing...");
    onRefresh();
  };

  const handleCreateFolder = async (folderpath: string) => {
    await apiClient.createFolder(folderpath);
    onRefresh();
  };

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
    <Sidebar className="w-80 lg:w-96">
      <SidebarHeader baseDir={baseDir} />

      <SidebarContent>
        {/* Recent Files Section */}
        {!search && (
          <>
            <SidebarRecentFiles
              recentFiles={recentFiles}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
            />
            <Separator />
          </>
        )}

        {/* Search Section */}
        <SidebarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search files..."
        />

        <Separator />

        {/* File Tree Section */}
        <SidebarFileTree
          fileTree={fileTree}
          currentFile={currentFile}
          onFileSelect={onFileSelect}
          onRename={handleRename}
          onDelete={handleDelete}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          isSearching={!!search}
        />
      </SidebarContent>
    </Sidebar>
  );
}
