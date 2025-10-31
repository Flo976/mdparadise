"use client";

import { useState, useMemo } from "react";
import { FileText, Folder, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { MarkdownFile } from "@/types";

interface FileSidebarProps {
  files: MarkdownFile[];
  currentFile: string | null;
  onFileSelect: (filepath: string) => void;
  baseDir: string;
}

export function FileSidebar({ files, currentFile, onFileSelect, baseDir }: FileSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredFiles = useMemo(() => {
    if (!search) return files;
    const searchLower = search.toLowerCase();
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchLower) ||
        file.path.toLowerCase().includes(searchLower)
    );
  }, [files, search]);

  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 3);
  }, [files]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">MDParadise</h2>
          <p className="text-xs text-muted-foreground truncate" title={baseDir}>
            {baseDir}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </SidebarGroupLabel>

          {/* Recent Files Section */}
          {!search && recentFiles.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                Recent Files
              </div>
              <div className="space-y-1">
                {recentFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => onFileSelect(file.path)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors ${
                      currentFile === file.path ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="h-px bg-border my-2" />
            </div>
          )}

          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <SidebarMenu>
                {filteredFiles.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {search ? "No files found" : "No markdown files"}
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <SidebarMenuItem key={file.path}>
                      <SidebarMenuButton
                        onClick={() => onFileSelect(file.path)}
                        isActive={currentFile === file.path}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4" />
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="font-medium truncate w-full">
                            {file.name}
                          </span>
                          {file.dir !== "." && (
                            <span className="text-xs text-muted-foreground truncate w-full flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {file.dir}
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
