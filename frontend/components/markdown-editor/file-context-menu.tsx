"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FilePlus, FolderPlus, File, Folder, Edit, Trash2 } from "lucide-react";
import { CreateFileDialog } from "./create-file-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";
import { RenameDialog } from "./rename-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { useState } from "react";

interface FileContextMenuProps {
  children: React.ReactNode;
  path: string;
  type: 'file' | 'folder';
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  onCreateFile: (filepath: string) => Promise<void>;
  onCreateFolder: (folderpath: string) => Promise<void>;
}

export function FileContextMenu({
  children,
  path,
  type,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
}: FileContextMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const folderPath = type === 'folder' ? path : path.split('/').slice(0, -1).join('/');

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {/* Show New File/Folder only for folders */}
          {type === 'folder' && (
            <>
              <ContextMenuItem
                onClick={() => setCreateFileOpen(true)}
                className="cursor-pointer"
              >
                <FilePlus className="mr-2 h-4 w-4" />
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => setCreateFolderOpen(true)}
                className="cursor-pointer"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}

          {/* Show Rename and Delete for both files and folders */}
          <ContextMenuItem
            onClick={() => setRenameOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setDeleteOpen(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>

          <ContextMenuSeparator />
          <ContextMenuItem disabled className="text-xs text-muted-foreground">
            {type === 'file' ? <File className="mr-2 h-3 w-3" /> : <Folder className="mr-2 h-3 w-3" />}
            {path}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Rename Dialog */}
      <RenameDialog
        currentPath={path}
        type={type}
        onRename={onRename}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        path={path}
        type={type}
        onDelete={onDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      {/* Create File Dialog (for folders) */}
      {type === 'folder' && (
        <CreateFileDialog
          currentPath={folderPath}
          onCreateFile={onCreateFile}
          open={createFileOpen}
          onOpenChange={setCreateFileOpen}
        />
      )}

      {/* Create Folder Dialog (for folders) */}
      {type === 'folder' && (
        <CreateFolderDialog
          currentPath={folderPath}
          onCreateFolder={onCreateFolder}
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
        />
      )}
    </>
  );
}
