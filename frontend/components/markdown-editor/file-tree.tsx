"use client";

import { useState } from "react";
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileContextMenu } from "./file-context-menu";
import type { TreeNode } from "@/lib/tree-utils";

interface FileTreeProps {
  nodes: TreeNode[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  onCreateFile: (filepath: string) => Promise<void>;
  onCreateFolder: (folderpath: string) => Promise<void>;
  level?: number;
}

export function FileTree({
  nodes,
  currentFile,
  onFileSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  level = 0,
}: FileTreeProps) {
  const [isRootDragOver, setIsRootDragOver] = useState(false);

  // Root drop zone handlers (for moving to root)
  const handleRootDragOver = (e: React.DragEvent) => {
    if (level > 0) return; // Only root level

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsRootDragOver(true);
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    if (level > 0) return;

    e.preventDefault();
    e.stopPropagation();
    setIsRootDragOver(false);
  };

  const handleRootDrop = async (e: React.DragEvent) => {
    if (level > 0) return;

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

  return (
    <div
      className={cn(
        "space-y-1", // Increased from space-y-0.5 to space-y-1 for better breathing room
        level > 0 && "ml-6", // Increased indentation from ml-4 to ml-6 for better hierarchy
        level === 0 && "min-h-[200px] p-2 rounded-lg transition-all",
        isRootDragOver && "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset"
      )}
      onDragOver={level === 0 ? handleRootDragOver : undefined}
      onDragLeave={level === 0 ? handleRootDragLeave : undefined}
      onDrop={level === 0 ? handleRootDrop : undefined}
    >
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          currentFile={currentFile}
          onFileSelect={onFileSelect}
          onRename={onRename}
          onDelete={onDelete}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          level={level}
        />
      ))}
      {level === 0 && isRootDragOver && (
        <div className="text-xs text-blue-600 dark:text-blue-400 text-center py-4">
          Drop here to move to root folder
        </div>
      )}
    </div>
  );
}

interface TreeNodeItemProps {
  node: TreeNode;
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  onCreateFile: (filepath: string) => Promise<void>;
  onCreateFolder: (folderpath: string) => Promise<void>;
  level: number;
}

function TreeNodeItem({
  node,
  currentFile,
  onFileSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  level,
}: TreeNodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const isFolder = node.type === 'folder';
  const isActive = !isFolder && currentFile === node.path;
  const hasChildren = isFolder && node.children && node.children.length > 0;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      path: node.path,
      type: node.type,
      name: node.name,
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFolder) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!isFolder) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const sourcePath = data.path;
      const sourceName = data.name;

      // Don't drop on itself or its children
      if (sourcePath === node.path || node.path.startsWith(sourcePath + '/')) {
        return;
      }

      // Construct new path
      const newPath = `${node.path}/${sourceName}`;

      // Perform rename (which is actually a move)
      await onRename(sourcePath, newPath);
    } catch (error) {
      console.error('Error during drag and drop:', error);
    }
  };

  return (
    <div>
      <FileContextMenu
        path={node.path}
        type={node.type}
        onRename={onRename}
        onDelete={onDelete}
        onCreateFile={onCreateFile}
        onCreateFolder={onCreateFolder}
      >
        <div
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group flex items-center gap-1.5 px-2 py-2 rounded-md cursor-pointer transition-all hover:bg-accent min-h-[36px]",
            isActive && "bg-accent",
            isDragOver && isFolder && "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400"
          )}
          onClick={handleClick}
        >
          {/* Expand/Collapse Icon */}
          {isFolder && (
            <button
              className="flex-shrink-0 p-0.5 hover:bg-accent-foreground/10 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}

          {/* Folder/File Icon */}
          <div className="flex-shrink-0">
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>

          {/* Name */}
          <span className={cn(
            "flex-1 truncate text-sm",
            isFolder && "font-semibold text-foreground",
            isActive && !isFolder && "font-semibold"
          )}>
            {node.name}
          </span>
        </div>
      </FileContextMenu>

      {/* Children */}
      {isFolder && isExpanded && hasChildren && (
        <FileTree
          nodes={node.children!}
          currentFile={currentFile}
          onFileSelect={onFileSelect}
          onRename={onRename}
          onDelete={onDelete}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          level={level + 1}
        />
      )}
    </div>
  );
}
