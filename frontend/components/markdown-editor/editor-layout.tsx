"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, Save, Eye, EyeOff, Code, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EnhancedSidebar } from "./enhanced-sidebar/EnhancedSidebar";
import { FileListContent } from "./file-list-content";
import { MarkdownEditor } from "./editor";
import { MarkdownPreview } from "./preview";
import { WysiwygEditor } from "./wysiwyg-editor";
import { apiClient } from "@/lib/api/client";
import { saveEditorState, loadEditorState } from "@/lib/persistence";
import type { MarkdownFile } from "@/types";

type ViewMode = "both" | "editor" | "preview";

export function EditorLayout() {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [baseDir, setBaseDir] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPreviewEditable, setIsPreviewEditable] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(false);
  const [hasRestoredOnce, setHasRestoredOnce] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hasUnsavedChanges = content !== originalContent;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force preview-only mode on mobile
  useEffect(() => {
    if (isMobile) {
      setViewMode("preview");
      setIsPreviewEditable(false);
    }
  }, [isMobile]);

  // Load files list
  const loadFiles = useCallback(async () => {
    try {
      const response = await apiClient.getFiles();
      if (response.success) {
        setFiles(response.files);
        setBaseDir(response.base_dir);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Auto-refresh files list every 5 seconds to detect new files
  useEffect(() => {
    const interval = setInterval(() => {
      loadFiles();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadFiles]);

  // Load file content
  const handleFileSelect = useCallback(async (filepath: string) => {
    // Don't do anything if we're selecting the same file that's already open
    if (currentFile === filepath) {
      return;
    }

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Do you want to continue?"
      );
      if (!confirmed) return;
    }

    try {
      const response = await apiClient.getFile(filepath);
      if (response.success) {
        setCurrentFile(filepath);
        setContent(response.content);
        setOriginalContent(response.content);
        setIsMobileMenuOpen(false);
      }
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  }, [currentFile, hasUnsavedChanges]);

  // Save file
  const handleSave = useCallback(async () => {
    if (!currentFile) return;

    setSaving(true);
    try {
      const response = await apiClient.saveFile(currentFile, content);
      if (response.success) {
        setOriginalContent(content);
      } else {
        alert("Error: " + response.error);
      }
    } catch (error) {
      console.error("Failed to save file:", error);
      alert("Failed to save file");
    } finally {
      setSaving(false);
    }
  }, [currentFile, content]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Restore editor state on load (only once)
  useEffect(() => {
    if (!baseDir || files.length === 0 || loading || isRestoringState || hasRestoredOnce) return;

    const savedState = loadEditorState();
    if (savedState && savedState.baseDir === baseDir && savedState.currentFile) {
      setIsRestoringState(true);
      setHasRestoredOnce(true);

      // Restore view mode and editable state
      setViewMode(savedState.viewMode);
      setIsPreviewEditable(savedState.isPreviewEditable);

      // Restore the last opened file if it exists and it's not already loaded
      const fileExists = files.some(f => f.path === savedState.currentFile);
      if (fileExists && currentFile !== savedState.currentFile) {
        handleFileSelect(savedState.currentFile);
      }

      // Reset the restoring flag after a short delay
      setTimeout(() => setIsRestoringState(false), 100);
    }
  }, [baseDir, files, loading, isRestoringState, hasRestoredOnce, currentFile, handleFileSelect]);

  // Save editor state whenever it changes
  useEffect(() => {
    if (!baseDir) return;

    saveEditorState({
      currentFile,
      viewMode,
      isPreviewEditable,
      baseDir,
    });
  }, [currentFile, viewMode, isPreviewEditable, baseDir]);

  const toggleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "both") return "preview";
      if (prev === "preview") return "editor";
      return "both";
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <EnhancedSidebar
          files={files}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onRefresh={loadFiles}
          baseDir={baseDir}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <FileListContent
            files={files}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            baseDir={baseDir}
          />
        </SheetContent>
      </Sheet>

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Toolbar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <SidebarTrigger className="hidden md:flex" />
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 min-w-0">
            {!currentFile && (
              <span className="text-lg font-bold md:hidden">MDParadise</span>
            )}
            {currentFile && (
              <>
                <span className="font-semibold truncate text-sm sm:text-base">
                  {currentFile}
                </span>
                {!isMobile && (
                  <Badge variant={hasUnsavedChanges ? "destructive" : "secondary"} className="text-xs">
                    {saving ? "Saving..." : hasUnsavedChanges ? "Unsaved" : "Saved"}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Desktop-only controls */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              {/* Editable Preview Toggle - Desktop */}
              {(viewMode === "preview" || viewMode === "both") && (
                <Button
                  variant={isPreviewEditable ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewEditable(!isPreviewEditable)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isPreviewEditable ? "Read Only" : "Edit Preview"}
                </Button>
              )}

              {/* View Toggle - Desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
              >
                {viewMode === "both" && (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Only
                  </>
                )}
                {viewMode === "preview" && (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Editor Only
                  </>
                )}
                {viewMode === "editor" && (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Show Both
                  </>
                )}
              </Button>

              {/* Save Button - Desktop */}
              <Button
                onClick={handleSave}
                disabled={!currentFile || !hasUnsavedChanges || saving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {!currentFile ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-4xl mb-4">📝</p>
                <p className="text-lg">Select a file to start editing</p>
              </div>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
              {(viewMode === "both" || viewMode === "editor") && (
                <>
                  <ResizablePanel defaultSize={50} minSize={30} className="overflow-hidden">
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      onSave={handleSave}
                    />
                  </ResizablePanel>
                  {viewMode === "both" && <ResizableHandle withHandle />}
                </>
              )}
              {(viewMode === "both" || viewMode === "preview") && (
                <ResizablePanel defaultSize={50} minSize={30} className="overflow-hidden">
                  {isPreviewEditable ? (
                    <WysiwygEditor value={content} onChange={setContent} />
                  ) : (
                    <MarkdownPreview content={content} />
                  )}
                </ResizablePanel>
              )}
            </ResizablePanelGroup>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
