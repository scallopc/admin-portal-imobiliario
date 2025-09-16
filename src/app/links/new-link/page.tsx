"use client"

import Title from "@/components/common/title"
import LinkForm from "../components/link-form"

export default function NewLinkPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Novo Link" subtitle="Cadastre um novo link" />
      <div className="bg-card text-card-foreground shadow-sm overflow-hidden rounded-lg p-4">
        <LinkForm />
      </div>
    </div>
  )
}


