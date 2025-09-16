import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UpdateLeadInput } from "@/actions/update-lead/schema"
import { leadQueryKey } from "@/hooks/queries/use-lead"
import { leadsQueryKey } from "@/hooks/queries/use-leads"
import { toast } from "sonner"

async function putLead(id: string, input: UpdateLeadInput): Promise<{ id: string }> {
  const res = await fetch(`/api/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Falha ao atualizar lead")
  return res.json()
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateLeadInput) => putLead(id, input),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: leadQueryKey(id) }),
        qc.invalidateQueries({ queryKey: leadsQueryKey() }),
      ])
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao atualizar lead"),
  })
}


