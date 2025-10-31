"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Menu, Save, Eye, EyeOff, Code, Edit3, Search, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { FileSidebar } from "./file-sidebar";
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
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const hasUnsavedChanges = content !== originalContent;

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!search) return [];
    const searchLower = search.toLowerCase();
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchLower) ||
        file.path.toLowerCase().includes(searchLower)
    );
  }, [files, search]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        "Vous avez des modifications non enregistrées. Voulez-vous continuer ?"
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
        alert("Erreur : " + response.error);
      }
    } catch (error) {
      console.error("Failed to save file:", error);
      alert("Échec de l'enregistrement du fichier");
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

  // Handle file rename
  const handleFileRename = useCallback(async (filepath: string, newName: string) => {
    try {
      const response = await apiClient.renameFile(filepath, newName);
      if (response.success) {
        // Reload files list
        await loadFiles();
        // If the renamed file is the current file, update the current file path
        if (currentFile === filepath && response.newPath) {
          setCurrentFile(response.newPath);
        }
      } else {
        alert("Erreur : " + response.error);
      }
    } catch (error) {
      console.error("Failed to rename file:", error);
      alert("Échec du renommage du fichier");
    }
  }, [currentFile, loadFiles]);

  // Handle file delete
  const handleFileDelete = useCallback(async (filepath: string) => {
    try {
      const response = await apiClient.deleteFile(filepath);
      if (response.success) {
        // Reload files list
        await loadFiles();
        // If the deleted file is the current file, clear it
        if (currentFile === filepath) {
          setCurrentFile(null);
          setContent("");
          setOriginalContent("");
        }
      } else {
        alert("Erreur : " + response.error);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Échec de la suppression du fichier");
    }
  }, [currentFile, loadFiles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <FileSidebar
          files={files}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          baseDir={baseDir}
          onFileRename={handleFileRename}
          onFileDelete={handleFileDelete}
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
            onFileRename={handleFileRename}
            onFileDelete={handleFileDelete}
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

          {/* Search bar - centered */}
          <div className="flex-1 flex justify-center items-center px-4" ref={searchRef}>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher des fichiers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="pl-9 pr-9 h-9"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search results dropdown */}
              {showSearchResults && search && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
                  {filteredFiles.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Aucun fichier trouvé
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredFiles.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => {
                            handleFileSelect(file.path);
                            setSearch("");
                            setShowSearchResults(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-3"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm">{file.name}</div>
                            {file.dir !== "." && (
                              <div className="text-xs text-muted-foreground truncate">{file.dir}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* File info and status */}
          <div className="flex items-center gap-2">
            {currentFile && (
              <>
                <div className="hidden lg:flex flex-col items-end">
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={baseDir}>
                    {baseDir}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate text-sm max-w-[200px]">
                      {currentFile}
                    </span>
                    {!isMobile && (
                      <Badge variant={hasUnsavedChanges ? "destructive" : "secondary"} className="text-xs">
                        {saving ? "Enregistrement..." : hasUnsavedChanges ? "Non enregistré" : "Enregistré"}
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Mobile/tablet: show only badge */}
                <div className="lg:hidden">
                  {!isMobile && (
                    <Badge variant={hasUnsavedChanges ? "destructive" : "secondary"} className="text-xs">
                      {saving ? "Enregistrement..." : hasUnsavedChanges ? "Non enregistré" : "Enregistré"}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

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
                  {isPreviewEditable ? "Lecture seule" : "Éditer l'aperçu"}
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
                    Aperçu seul
                  </>
                )}
                {viewMode === "preview" && (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Éditeur seul
                  </>
                )}
                {viewMode === "editor" && (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Afficher les deux
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
                Enregistrer
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
                <p className="text-lg">Sélectionnez un fichier pour commencer l'édition</p>
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
