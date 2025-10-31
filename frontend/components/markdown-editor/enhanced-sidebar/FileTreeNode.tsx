"use client";

import { useState } from "react";
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "@/components/ui/sidebar";
import { FileContextMenu } from "../file-context-menu";
import type { TreeNode } from "@/lib/tree-utils";

interface FileTreeNodeProps {
  node: TreeNode;
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  onCreateFile: (filepath: string) => Promise<void>;
  onCreateFolder: (folderpath: string) => Promise<void>;
  level?: number;
}

export function FileTreeNode({
  node,
  currentFile,
  onFileSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  level = 0,
}: FileTreeNodeProps) {
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

  // File node (leaf)
  if (!isFolder) {
    return (
      <SidebarMenuItem>
        <FileContextMenu
          path={node.path}
          type={node.type}
          onRename={onRename}
          onDelete={onDelete}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
        >
          <SidebarMenuButton
            draggable
            onDragStart={handleDragStart}
            isActive={isActive}
            onClick={handleClick}
            className={cn(
              "cursor-pointer",
              isActive && "bg-accent font-medium"
            )}
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{node.name}</span>
          </SidebarMenuButton>
        </FileContextMenu>
      </SidebarMenuItem>
    );
  }

  // Folder node (collapsible)
  return (
    <SidebarMenuItem>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <FileContextMenu
          path={node.path}
          type={node.type}
          onRename={onRename}
          onDelete={onDelete}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              draggable
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              className={cn(
                "cursor-pointer group",
                isDragOver && "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400"
              )}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
              )}
              <span className="truncate font-semibold">{node.name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </FileContextMenu>
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {node.children!.map((child) => (
                <FileTreeNode
                  key={child.path}
                  node={child}
                  currentFile={currentFile}
                  onFileSelect={onFileSelect}
                  onRename={onRename}
                  onDelete={onDelete}
                  onCreateFile={onCreateFile}
                  onCreateFolder={onCreateFolder}
                  level={level + 1}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  );
}
