"use client"

import React, { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChipAutocompleteProps {
  value: string[]
  onChange: (value: string[]) => void
  suggestions: readonly string[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ChipAutocomplete({
  value = [],
  onChange,
  suggestions,
  placeholder = "Digite uma característica...",
  className,
  disabled = false
}: ChipAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar sugestões baseado no input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(suggestion)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, suggestions, value])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addChip = (chipValue: string) => {
    const trimmedValue = chipValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeChip = (chipToRemove: string) => {
    onChange(value.filter(chip => chip !== chipToRemove))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addChip(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove o último chip se o input estiver vazio e pressionar backspace
      removeChip(value[value.length - 1])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addChip(suggestion)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background min-h-[40px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 items-start">
        {value.map((chip, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 h-6" 
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
         <Textarea
           ref={inputRef}
           value={inputValue}
           onChange={handleInputChange}
           onKeyDown={handleKeyDown}
           onFocus={() => {
             if (inputValue.trim()) {
               setShowSuggestions(true)
             }
           }}
           placeholder={value.length === 0 ? placeholder : ""}
           className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-6 resize-none"
           disabled={disabled}
           rows={1}
         />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
