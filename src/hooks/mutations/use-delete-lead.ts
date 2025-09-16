import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { leadsQueryKey } from "@/hooks/queries/use-leads"

async function delLead(id: string): Promise<{ success: true }> {
  const res = await fetch(`/api/leads/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Falha ao excluir lead")
  return res.json()
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: delLead,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: leadsQueryKey() })
      toast.success("Lead excluído com sucesso")
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao excluir lead"),
  })
}


