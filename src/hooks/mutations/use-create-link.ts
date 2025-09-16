import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateLinkInput, CreateLinkResponse } from "@/actions/create-link/schema"
import { linksQueryKey } from "@/hooks/queries/use-links"

export const createLinkMutationKey = () => ["links", "create"] as const

async function createLinkRequest(input: CreateLinkInput): Promise<CreateLinkResponse> {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Falha ao criar link")
  return res.json()
}

export function useCreateLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: createLinkMutationKey(),
    mutationFn: createLinkRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linksQueryKey() }),
  })
}


