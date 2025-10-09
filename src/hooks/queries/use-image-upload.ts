import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type ImageUploadState = {
  isUploading: boolean;
  error: string | null;
  progress: number;
  currentFile: string | null;
  totalFiles: number;
  uploadedFiles: number;
};

type UseImageUploadReturn = [
  (files: File[] | FileList | null, propertyId: string) => Promise<string[]>,
  ImageUploadState,
  (urls: string[]) => Promise<void>,
  () => void
];

export function useImageUpload(): UseImageUploadReturn {
  const [state, setState] = useState<Omit<ImageUploadState, 'reset'>>({
    isUploading: false,
    error: null,
    progress: 0,
    currentFile: null,
    totalFiles: 0,
    uploadedFiles: 0,
  });

  // Usamos uma ref para o estado para evitar dependência no useCallback
  const stateRef = useRef(state);
  stateRef.current = state;

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      error: null,
      progress: 0,
      currentFile: null,
      totalFiles: 0,
      uploadedFiles: 0,
    });
  }, []);

  const updateProgress = useCallback((progress: number, currentFile?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      ...(currentFile && { currentFile }),
    }));
  }, []);

  const uploadImages = useCallback(
    async (files: File[] | FileList | null, propertyId: string): Promise<string[]> => {
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return [];
    }

    const fileArray = Array.from(files);
    
    try {
      setState(prev => ({
        ...prev,
        isUploading: true,
        error: null,
        progress: 0,
        totalFiles: fileArray.length,
        uploadedFiles: 0,
      }));

      const formData = new FormData();
      formData.append('propertyId', propertyId);
      fileArray.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload das imagens');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        uploadedFiles: fileArray.length,
        progress: 100,
      }));
      
      return data.urls;
      
    } catch (error) {
      console.error('Error in uploadImages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload das imagens';
      toast.error(errorMessage);
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      setState(prev => ({
        ...prev,
        isUploading: false,
      }));
    }
  }, []);

  const deleteImages = useCallback(async (urls: string[]): Promise<void> => {
    if (!urls || urls.length === 0) return;
    
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error deleting images:', error);
      }
    } catch (error) {
      console.error('Error in deleteImages:', error);
      // We don't throw here as this is a background operation
    }
  }, []);

  return [uploadImages, state, deleteImages, reset];
}
