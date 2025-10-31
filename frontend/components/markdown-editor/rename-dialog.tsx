"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import path from "path";

interface RenameDialogProps {
  currentPath: string;
  type: 'file' | 'folder';
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RenameDialog({ currentPath, type, onRename, trigger, open: controlledOpen, onOpenChange }: RenameDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const basename = currentPath.split('/').pop() || "";
      setNewName(basename);
    }
  }, [open, currentPath]);

  const handleRename = async () => {
    if (!newName.trim()) {
      setError("Name is required");
      return;
    }

    if (type === 'file' && !newName.endsWith('.md')) {
      setError("Filename must end with .md");
      return;
    }

    const currentDir = currentPath.split('/').slice(0, -1).join('/');
    const newPath = currentDir ? `${currentDir}/${newName}` : newName;

    if (newPath === currentPath) {
      setError("New name is the same as current name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onRename(currentPath, newPath);
      toast({
        title: `${type === 'file' ? 'File' : 'Folder'} renamed`,
        description: `Successfully renamed to ${newName}`,
      });
      setOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to rename ${type}`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleRename();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {type === 'file' ? 'File' : 'Folder'}</DialogTitle>
          <DialogDescription>
            Enter a new name for {currentPath}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="newname" className="text-sm font-medium">
              New Name
            </label>
            <Input
              id="newname"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={loading}>
            {loading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
