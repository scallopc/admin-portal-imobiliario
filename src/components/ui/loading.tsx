import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  centered?: boolean
}

export function Loading({
  message = "Carregando dados...",
  size = 'md',
  className,
  centered = true
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const containerClasses = centered 
    ? "flex items-center justify-center p-12"
    : "flex items-center p-4"

  return (
    <div className={cn(containerClasses, className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <span className="ml-2">{message}</span>
      )}
    </div>
  )
}
