"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Edit2,
  Trash2,
  GripVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MarkdownFile } from "@/types";

interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
  size?: number;
  mtime?: number;
}

interface FileTreeViewProps {
  files: MarkdownFile[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onFileRename: (filepath: string, newName: string) => void;
  onFileDelete: (filepath: string) => void;
  onFileMove?: (filepath: string, newPath: string) => void;
}

function buildTree(files: MarkdownFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  const folderMap = new Map<string, TreeNode>();

  // First pass: create folders from directory entries
  files.forEach((file) => {
    if (file.type === "directory") {
      const folderNode: TreeNode = {
        id: file.path,
        name: file.name,
        path: file.path,
        type: "folder",
        children: [],
      };
      folderMap.set(file.path, folderNode);
    }
  });

  // Second pass: organize folders into hierarchy
  folderMap.forEach((folder) => {
    if (folder.path.includes("/")) {
      const parentPath = folder.path.substring(0, folder.path.lastIndexOf("/"));
      const parent = folderMap.get(parentPath);
      if (parent) {
        parent.children!.push(folder);
      } else {
        // Parent doesn't exist in map, add to root
        root.push(folder);
      }
    } else {
      // Top-level folder
      root.push(folder);
    }
  });

  // Third pass: add files
  files.forEach((file) => {
    if (file.type === "file" || !file.type) {
      const fileNode: TreeNode = {
        id: file.path,
        name: file.name,
        path: file.path,
        type: "file",
        size: file.size,
        mtime: file.mtime,
      };

      if (file.dir === ".") {
        root.push(fileNode);
      } else if (folderMap.has(file.dir)) {
        folderMap.get(file.dir)!.children!.push(fileNode);
      } else {
        // Folder doesn't exist, add to root
        root.push(fileNode);
      }
    }
  });

  // Sort: folders first, then by name
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    nodes.forEach((node) => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(root);
  return root;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  onFileRename: (filepath: string, newName: string) => void;
  onFileDelete: (filepath: string) => void;
  renamingFile: string | null;
  setRenamingFile: (path: string | null) => void;
  newFileName: string;
  setNewFileName: (name: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}

function SortableTreeItem({
  node,
  level,
  currentFile,
  onFileSelect,
  onFileRename,
  onFileDelete,
  renamingFile,
  setRenamingFile,
  newFileName,
  setNewFileName,
  expandedFolders,
  toggleFolder,
}: TreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpanded = expandedFolders.has(node.path);
  const isFolder = node.type === "folder";

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer ${
              currentFile === node.path ? "bg-accent" : ""
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.path);
              } else {
                onFileSelect(node.path);
              }
            }}
          >
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>

            {isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.path);
                }}
                className="flex items-center"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}

            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
              )
            ) : (
              <FileText className="h-4 w-4 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              {renamingFile === node.path ? (
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onFileRename(node.path, newFileName);
                      setRenamingFile(null);
                    } else if (e.key === "Escape") {
                      setRenamingFile(null);
                    }
                  }}
                  onBlur={() => setRenamingFile(null)}
                  autoFocus
                  className="h-6 text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs truncate block">{node.name}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-xs break-all">{node.path}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {!isFolder && node.size !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {formatFileSize(node.size)}
              </Badge>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={() => {
              setRenamingFile(node.path);
              setNewFileName(node.name);
            }}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Renommer
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              if (
                confirm(
                  `Êtes-vous sûr de vouloir supprimer "${node.name}" ?`
                )
              ) {
                onFileDelete(node.path);
              }
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <SortableTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onFileRename={onFileRename}
              onFileDelete={onFileDelete}
              renamingFile={renamingFile}
              setRenamingFile={setRenamingFile}
              newFileName={newFileName}
              setNewFileName={setNewFileName}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTreeView({
  files,
  currentFile,
  onFileSelect,
  onFileRename,
  onFileDelete,
  onFileMove,
}: FileTreeViewProps) {
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const tree = useMemo(() => buildTree(files), [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onFileMove) {
      const sourceId = active.id as string;
      const targetId = over.id as string;

      // Find source and target nodes
      const sourceNode = flatTree.find((n) => n.id === sourceId);
      const targetNode = flatTree.find((n) => n.id === targetId);

      if (!sourceNode || !targetNode) {
        setActiveId(null);
        return;
      }

      // Determine new path based on target type
      let newPath: string;

      if (targetNode.type === "folder") {
        // Moving into a folder
        newPath = `${targetNode.path}/${sourceNode.name}`;
      } else {
        // Moving next to a file (same directory)
        const targetDir = targetNode.path.includes("/")
          ? targetNode.path.substring(0, targetNode.path.lastIndexOf("/"))
          : ".";

        newPath = targetDir === "."
          ? sourceNode.name
          : `${targetDir}/${sourceNode.name}`;
      }

      // Don't move if it's the same location
      if (newPath !== sourceNode.path) {
        onFileMove(sourceNode.path, newPath);
      }
    }

    setActiveId(null);
  };

  const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    const traverse = (node: TreeNode) => {
      result.push(node);
      if (node.children && expandedFolders.has(node.path)) {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return result;
  };

  const flatTree = useMemo(() => flattenTree(tree), [tree, expandedFolders]);
  const itemIds = useMemo(() => flatTree.map((node) => node.id), [flatTree]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {tree.map((node) => (
            <SortableTreeItem
              key={node.id}
              node={node}
              level={0}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onFileRename={onFileRename}
              onFileDelete={onFileDelete}
              renamingFile={renamingFile}
              setRenamingFile={setRenamingFile}
              newFileName={newFileName}
              setNewFileName={setNewFileName}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="bg-background border rounded-md px-2 py-1.5 shadow-lg">
            <span className="text-sm">
              {flatTree.find((n) => n.id === activeId)?.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
