"use client";

import { Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarkdownFile } from "@/types";

interface SidebarRecentFilesProps {
  recentFiles: MarkdownFile[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
}

export function SidebarRecentFiles({
  recentFiles,
  currentFile,
  onFileSelect,
}: SidebarRecentFilesProps) {
  if (recentFiles.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
        <Clock className="h-3.5 w-3.5" />
        <span>Recent Files</span>
      </div>
      <div className="space-y-1">
        {recentFiles.map((file) => (
          <button
            key={file.path}
            onClick={() => onFileSelect(file.path)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors group",
              currentFile === file.path && "bg-accent font-medium"
            )}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="truncate">{file.name}</span>
            </div>
            {file.dir !== "." && (
              <div className="text-xs text-muted-foreground truncate mt-0.5 pl-5">
                {file.dir}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
