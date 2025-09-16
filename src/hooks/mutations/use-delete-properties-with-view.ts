import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const deletePropertiesWithViewMutationKey = () => ["delete-properties-with-view"];

export function useDeletePropertiesWithView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deletePropertiesWithViewMutationKey(),
    mutationFn: async () => {
      const response = await fetch("/api/delete-properties-with-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar imóveis com propriedade 'views'");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        // Invalidar queries relacionadas a imóveis para atualizar a UI
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      } else {
        toast.error(data.message || "Erro ao deletar imóveis");
      }
    },
    onError: (error) => {
      console.error("Erro na mutation delete-properties-with-view:", error);
      toast.error("Erro ao deletar imóveis com propriedade 'views'");
    },
  });
}
