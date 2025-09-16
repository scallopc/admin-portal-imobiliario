"use client"

import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useRef } from "react"

type UploadButtonProps = {
  onUpload: (file: File) => void
  isLoading?: boolean
  className?: string
  disabled?: boolean
  accept?: string
}

export function UploadButton({ 
  onUpload, 
  isLoading, 
  className, 
  disabled = false,
  accept = ".xlsx,.xls,.csv"
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClick}
        disabled={isLoading || disabled}
        className={className}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? 'Importando...' : 'Importar'}
      </Button>
    </>
  )
}
