"use client"

import PropertyForm, { type PropertyFormData } from "@/app/property/components/property-form"
import { useCreateProperty } from "@/hooks/mutations/use-create-property"
import { toast } from "sonner"
import Title from "@/components/common/title"

export default function NewPropertyPage() {
  const { mutateAsync, isPending } = useCreateProperty()

  async function handleSubmit(data: PropertyFormData) {
    try {
      const res = await mutateAsync(data)
      toast.success("Imóvel atualizado com sucesso")
    } catch (e) {
      if (e instanceof Error) {
        if ((e as any)?.message?.includes("401") || (e as any)?.cause === 401) {
          toast.error("Sessão expirada. Faça login para continuar.")
          return
        }
        toast.error(e.message || "Falha ao atualizar o imóvel")
      } else {
        toast.error("Falha ao atualizar o imóvel")
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Novo Imóvel" subtitle="Adicione um novo imóvel" />
      <PropertyForm onSubmit={handleSubmit} isSubmitting={isPending} resetOnSuccess />
    </div>
  )
}
