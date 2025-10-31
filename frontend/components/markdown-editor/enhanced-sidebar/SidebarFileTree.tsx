"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { FileTreeNode } from "./FileTreeNode";
import type { TreeNode } from "@/lib/tree-utils";

interface SidebarFileTreeProps {
  fileTree: TreeNode[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  onCreateFile: (filepath: string) => Promise<void>;
  onCreateFolder: (folderpath: string) => Promise<void>;
  isSearching: boolean;
}

export function SidebarFileTree({
  fileTree,
  currentFile,
  onFileSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  isSearching,
}: SidebarFileTreeProps) {
  const [isRootDragOver, setIsRootDragOver] = useState(false);

  // Root drop zone handlers (for moving to root)
  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsRootDragOver(true);
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRootDragOver(false);
  };

  const handleRootDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRootDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const sourcePath = data.path;
      const sourceName = data.name;

      // Only move if not already at root
      if (sourcePath.includes('/')) {
        const newPath = sourceName;
        await onRename(sourcePath, newPath);
      }
    } catch (error) {
      console.error('Error during root drop:', error);
    }
  };

  if (fileTree.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="px-4 py-2">Files</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {isSearching ? "No files found" : "No markdown files"}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 py-2">Files</SidebarGroupLabel>
      <SidebarGroupContent>
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div
            className={cn(
              "px-2 py-2 min-h-[200px] rounded-lg transition-all",
              isRootDragOver && "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset"
            )}
            onDragOver={handleRootDragOver}
            onDragLeave={handleRootDragLeave}
            onDrop={handleRootDrop}
          >
            <SidebarMenu>
              {fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  currentFile={currentFile}
                  onFileSelect={onFileSelect}
                  onRename={onRename}
                  onDelete={onDelete}
                  onCreateFile={onCreateFile}
                  onCreateFolder={onCreateFolder}
                />
              ))}
            </SidebarMenu>
            {isRootDragOver && (
              <div className="text-xs text-blue-600 dark:text-blue-400 text-center py-4">
                Drop here to move to root folder
              </div>
            )}
          </div>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
