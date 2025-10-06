import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Carregando..." }: LoadingProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-gold/30 flex flex-row items-center gap-4 rounded-2xl border bg-[#1a1510] p-8 shadow-2xl">
        <Loader2 className="text-gold h-8 w-8 animate-spin" />
        {message && <span className="text-primary-clean font-semibold">{message}</span>}
      </div>
    </div>
  );
}
