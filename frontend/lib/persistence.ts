// Utility for persisting editor state to localStorage

export interface EditorState {
  currentFile: string | null;
  viewMode: "both" | "editor" | "preview";
  isPreviewEditable: boolean;
  baseDir: string;
}

const STORAGE_KEY = "mdparadise-editor-state";

export function saveEditorState(state: EditorState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save editor state:", error);
  }
}

export function loadEditorState(): EditorState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load editor state:", error);
    return null;
  }
}

export function clearEditorState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear editor state:", error);
  }
}
