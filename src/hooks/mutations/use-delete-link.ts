import { useMutation, useQueryClient } from "@tanstack/react-query"
import { linksQueryKey } from "@/hooks/queries/use-links"

export const deleteLinkMutationKey = () => ["links", "delete"] as const

async function deleteLinkRequest(id: string): Promise<void> {
  const res = await fetch(`/api/links/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Falha ao excluir link")
}

export function useDeleteLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: deleteLinkMutationKey(),
    mutationFn: deleteLinkRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linksQueryKey() }),
  })
}


