"use client"

import Title from "@/components/common/title"
import LeadForm from "@/app/leads/components/lead-form"
import { useParams, useRouter } from "next/navigation"
import { useLead } from "@/hooks/queries/use-lead"
import { useUpdateLead } from "@/hooks/mutations/use-update-lead"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function EditLeadPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const { data, isLoading, error } = useLead(id)
  const { mutateAsync, isPending } = useUpdateLead(id)

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Editar Lead" subtitle="Edite um lead" />

      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando lead...</span>
        </div>
      )}

      {(!isLoading && (error || !data)) && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p>Não foi possível carregar os dados do lead.</p>
        </div>
      )}

      {!isLoading && data && (
        <LeadForm
          defaultValues={data}
          isSubmitting={isPending}
          onSubmit={async (d) => {
            try {
              await mutateAsync(d)
              toast.success("Lead atualizado com sucesso")
              router.push("/leads")
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Erro ao atualizar lead")
            }
          }}
        />
      )}
    </div>
  )
}
