import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  error?: string | Error | null
  onRetry?: () => void
  retryText?: string
  className?: string
  showRetry?: boolean
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar os dados.",
  error,
  onRetry,
  retryText = "Tentar novamente",
  className,
  showRetry = true
}: ErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className={cn("rounded-md bg-destructive/15 p-4 text-destructive", className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
          {error && (
            <p className="mt-2 text-xs opacity-75">
              {error instanceof Error ? error.message : String(error)}
            </p>
          )}
          {showRetry && (
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="mt-4 border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
