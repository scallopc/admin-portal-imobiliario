"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type ExportButtonProps = {
  onExport: () => void
  isLoading?: boolean
  className?: string
  disabled?: boolean
}

export function ExportButton({ onExport, isLoading, className, disabled = false }: ExportButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onExport}
      disabled={isLoading || disabled}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? 'Exportando...' : 'Exportar'}
    </Button>
  )
}
