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
}

export const apiClient = new ApiClient();
