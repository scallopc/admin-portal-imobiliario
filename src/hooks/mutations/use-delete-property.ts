import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { propertiesQueryKey } from "@/hooks/queries/use-properties"

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Falha ao excluir o imóvel")
      }
      
      // Não tenta fazer parse da resposta quando for 204 No Content
      if (response.status === 204) {
        return null
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertiesQueryKey() })
      toast.success("Imóvel excluído com sucesso!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ocorreu um erro ao excluir o imóvel")
    },
  })
}
