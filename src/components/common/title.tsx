"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Title({ 
  title, 
  subtitle, 
  buttonText, 
  buttonHref 
}: { 
  title: string
  subtitle?: string
  buttonText?: string
  buttonHref?: string
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {buttonText && buttonHref && (
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={buttonHref}>{buttonText}</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}