"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthYearPickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Selecione mês e ano",
  disabled = false,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  const formatDate = (date: Date) => {
    const formatted = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-transparent hover:text-foreground",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            formatDate(value)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={(date) =>
            date > new Date("2100-12-31") || date < new Date("2020-01-01")
          }
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
