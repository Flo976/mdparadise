"use client";

import { useState } from "react";
import { FilePlus } from "lucide-react";
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

interface CreateFileDialogProps {
  currentPath?: string;
  onCreateFile: (filepath: string) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateFileDialog({ currentPath = "", onCreateFile, trigger, open: controlledOpen, onOpenChange }: CreateFileDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!filename.trim()) {
      setError("Filename is required");
      return;
    }

    if (!filename.endsWith('.md')) {
      setError("Filename must end with .md");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const filepath = currentPath ? `${currentPath}/${filename}` : filename;
      await onCreateFile(filepath);
      toast({
        title: "File created",
        description: `Successfully created ${filename}`,
      });
      setOpen(false);
      setFilename("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create file";
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
            <FilePlus className="h-4 w-4 mr-2" />
            New File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Create a new markdown file {currentPath && `in ${currentPath}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="filename" className="text-sm font-medium">
              Filename
            </label>
            <Input
              id="filename"
              placeholder="example.md"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
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
