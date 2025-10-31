import type {
  FilesResponse,
  FileContentResponse,
  SaveFileResponse,
  FileOperationResponse,
  FolderOperationResponse,
} from '@/types';

export class ApiClient {
  // ==================== File Listing ====================

  async getFiles(): Promise<FilesResponse> {
    const response = await fetch('/api/files');
    return response.json();
  }

  // ==================== File Operations ====================

  async getFile(filepath: string): Promise<FileContentResponse> {
    const response = await fetch(`/api/file/${filepath}`);
    return response.json();
  }

  async saveFile(filepath: string, content: string): Promise<SaveFileResponse> {
    const response = await fetch(`/api/file/${filepath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  }

  async createFile(filepath: string, content: string = ''): Promise<SaveFileResponse> {
    return this.saveFile(filepath, content);
  }

  async deleteFile(filepath: string): Promise<FileOperationResponse> {
    const response = await fetch(`/api/file/${filepath}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async renameFile(oldPath: string, newPath: string): Promise<FileOperationResponse> {
    const response = await fetch(`/api/file/${oldPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPath }),
    });
    return response.json();
  }

  async moveFile(oldPath: string, newPath: string): Promise<FileOperationResponse> {
    return this.renameFile(oldPath, newPath);
  }

  // ==================== Folder Operations ====================

  async createFolder(folderPath: string): Promise<FolderOperationResponse> {
    const response = await fetch('/api/folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: folderPath }),
    });
    return response.json();
  }

  async deleteFolder(folderPath: string): Promise<FolderOperationResponse> {
    const response = await fetch(`/api/folder/${folderPath}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async renameFolder(oldPath: string, newPath: string): Promise<FolderOperationResponse> {
    const response = await fetch(`/api/folder/${oldPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPath }),
    });
    return response.json();
  }

  async moveFolder(oldPath: string, newPath: string): Promise<FolderOperationResponse> {
    return this.renameFolder(oldPath, newPath);
  }
}

export const apiClient = new ApiClient();
