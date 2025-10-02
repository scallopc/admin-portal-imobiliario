"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useDropzone, type DropzoneOptions, type FileRejection } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { X, Upload, Loader2, Maximize2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/queries/use-image-upload";
import { Progress } from "@/components/ui/progress"

type ImageValue = string | File;

type ImageUploadProps = {
  value: ImageValue[];
  onChange: (value: ImageValue[]) => void;
  onRemoveUrl?: (url: string) => void; // Nova prop
  className?: string;
};
export function ImageUpload({ value = [], onChange, onRemoveUrl, className }: ImageUploadProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState<number | null>(null)
  const prevValueRef = useRef<ImageValue[]>(value);
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [handleUpload, uploadState, , resetUploadState] = useImageUpload();

  // Reseta o estado de upload quando o componente é desmontado
  useEffect(() => {
    return () => {
      resetUploadState()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [resetUploadState])

  // Efeito para detectar mudanças nas imagens e ativar animações
  useEffect(() => {
    if (prevValueRef.current.length < value.length) {
      // Nova imagem adicionada
      setIsAnimating(value.length - 1)
      timeoutRef.current = setTimeout(() => setIsAnimating(null), 300)
    } else if (prevValueRef.current.length > value.length) {
      // Imagem removida
      setIsAnimating(-1)
      timeoutRef.current = setTimeout(() => setIsAnimating(null), 300)
    }
    prevValueRef.current = value
  }, [value.length])

  // Mensagem de status baseada no estado do upload
  const statusMessage = useMemo(() => {
    if (uploadState.error) {
      return (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadState.error}</span>
        </div>
      )
    }

    if (uploadState.isUploading) {
      return (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {uploadState.currentFile || 'Enviando imagens...'}
            </span>
            <span className="font-medium">
              {uploadState.uploadedFiles} de {uploadState.totalFiles}
            </span>
          </div>
          <Progress value={uploadState.progress} className="h-2" />
        </div>
      )
    }

    if (uploadState.uploadedFiles > 0 && !uploadState.isUploading) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>Upload concluído com sucesso!</span>
        </div>
      )
    }

    return null
  }, [uploadState])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange([...value, ...acceptedFiles]);
    },
    [value, onChange]
  );

  const removeImage = (index: number) => {
    if (uploadState.isUploading) {
      return;
    }

    const itemToRemove = value[index];

    // Se for uma string (URL salva), notifica a remoção
    if (typeof itemToRemove === 'string' && onRemoveUrl) {
      onRemoveUrl(itemToRemove);
    }

    // Atualiza o estado visual removendo o item
    onChange(value.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploadState.isUploading,
  });
  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploadState.isUploading && "opacity-50 cursor-not-allowed"
        )}
        aria-disabled={uploadState.isUploading}
      >
        <input {...getInputProps()} disabled={uploadState.isUploading} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {uploadState.isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}

          <div className="w-full space-y-2">
            <p className="text-sm font-medium">
              {uploadState.isUploading
                ? 'Enviando imagens...'
                : isDragActive
                  ? "Solte as imagens aqui"
                  : "Arraste e solte imagens aqui, ou clique para selecionar"}
            </p>

            {!uploadState.isUploading && (
              <p className="text-xs text-muted-foreground">
                Formatos suportados: JPG, PNG, WEBP (máx. 10MB)
              </p>
            )}

            {statusMessage && (
              <div className="mt-2">
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          <p>Não foi possível carregar alguns arquivos. Verifique os formatos e tente novamente.</p>
        </div>
      )}

      {uploadState.error && (
        <div className="text-sm text-destructive">
          <p>{uploadState.error}</p>
        </div>
      )}

      {value && value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((item, index) => {
            const previewUrl = typeof item === 'string' ? item : URL.createObjectURL(item);
            const key = typeof item === 'string' ? item : `${item.name}-${item.lastModified}`;

            if (!previewUrl) return null;

            return (
              <div
                key={key}
                className={cn(
                  "relative group rounded-md overflow-hidden border border-border aspect-square",
                  isAnimating === index && "animate-fade-in",
                  isAnimating === -1 && "animate-fade-out"
                )}
              >
                <img
                  src={previewUrl}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => setFullscreenImage(previewUrl)}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="cursor-pointer absolute top-2 right-2 p-1 rounded-full bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remover imagem"
                  disabled={uploadState.isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenImage(previewUrl)}
                  className="cursor-pointer absolute top-2 left-2 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Ampliar imagem"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={fullscreenImage}
              alt="Visualização em tela cheia"
              className="max-w-full max-h-[80vh] mx-auto object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFullscreenImage(null)
              }}
              className="cursor-pointer absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Adiciona a animação de fadeIn
const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`

// Adiciona os estilos de animação ao documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = fadeInKeyframes
  document.head.appendChild(style)
}
