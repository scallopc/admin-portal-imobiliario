import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UpdateLinkInput } from "@/actions/update-link/schema"
import { linkQueryKey } from "@/hooks/queries/use-link"
import { linksQueryKey } from "@/hooks/queries/use-links"

export const updateLinkMutationKey = () => ["links", "update"] as const

async function updateLinkRequest(id: string, input: UpdateLinkInput): Promise<void> {
  const res = await fetch(`/api/links/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Falha ao atualizar link")
}

export function useUpdateLink(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateLinkMutationKey(),
    mutationFn: (input: UpdateLinkInput) => updateLinkRequest(id as string, input),
    onSuccess: () => {
      if (id) queryClient.invalidateQueries({ queryKey: linkQueryKey(id) })
      queryClient.invalidateQueries({ queryKey: linksQueryKey() })
    },
  })
}


