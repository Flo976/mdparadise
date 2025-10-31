import type { FilesResponse, FileContentResponse, SaveFileResponse } from '@/types';

export class ApiClient {
  async getFiles(): Promise<FilesResponse> {
    const response = await fetch('/api/files');
    return response.json();
  }

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

  async deleteFile(filepath: string): Promise<SaveFileResponse> {
    const response = await fetch(`/api/file/${filepath}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async renameFile(filepath: string, newName: string): Promise<SaveFileResponse & { newPath?: string }> {
    const response = await fetch(`/api/file/${filepath}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newName }),
    });
    return response.json();
  }

  async createFileOrFolder(type: 'file' | 'folder', name: string, directory?: string): Promise<SaveFileResponse & { path?: string }> {
    const response = await fetch('/api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, name, directory }),
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
