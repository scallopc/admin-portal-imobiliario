"use client"

export default function SummaryCard({ 
    title, 
    subtitle, 

  }: { 
    title: string
    subtitle?: any
  }) {
      return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{subtitle}</p>
        </div>
      </div>
      )
  }