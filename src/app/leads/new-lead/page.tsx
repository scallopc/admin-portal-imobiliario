"use client"

import LeadForm from "@/app/leads/components/lead-form"
import { useCreateLead } from "@/hooks/mutations/use-create-lead"
import { toast } from "sonner"
import Title from "@/components/common/title"

export default function NewLeadPage() {
  const { mutateAsync, isPending } = useCreateLead()

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Novo Lead" subtitle="Adicione um novo lead" />
      <LeadForm onSubmit={async (d) => {
        try {
          await mutateAsync(d)
          toast.success("Lead criado com sucesso")
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Erro ao criar lead")
        }
      }} isSubmitting={isPending} resetOnSuccess />
    </div>
  )
}
