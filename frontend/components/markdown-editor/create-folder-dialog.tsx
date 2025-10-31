"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
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

interface CreateFolderDialogProps {
  currentPath?: string;
  onCreateFolder: (folderpath: string) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateFolderDialog({ currentPath = "", onCreateFolder, trigger, open: controlledOpen, onOpenChange }: CreateFolderDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [foldername, setFoldername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!foldername.trim()) {
      setError("Folder name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const folderpath = currentPath ? `${currentPath}/${foldername}` : foldername;
      await onCreateFolder(folderpath);
      toast({
        title: "Folder created",
        description: `Successfully created ${foldername}`,
      });
      setOpen(false);
      setFoldername("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create folder";
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
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder {currentPath && `in ${currentPath}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="foldername" className="text-sm font-medium">
              Folder Name
            </label>
            <Input
              id="foldername"
              placeholder="my-folder"
              value={foldername}
              onChange={(e) => setFoldername(e.target.value)}
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
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
