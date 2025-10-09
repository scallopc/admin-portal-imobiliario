import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { releasesQueryKey } from "@/hooks/queries/use-releases"

export function useDeleteRelease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/releases/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Falha ao excluir o lançamento")
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesQueryKey() })
      toast.success("Lançamento excluído com sucesso!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ocorreu um erro ao excluir o lançamento")
    },
  })
}
