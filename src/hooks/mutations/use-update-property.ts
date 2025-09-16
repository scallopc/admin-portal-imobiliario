import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdatePropertyInput } from "@/actions/update-property/schema";
import { toast } from "sonner";
import { propertyQueryKey } from "@/hooks/queries/use-property";
import { propertiesQueryKey } from "@/hooks/queries/use-properties";

export const updatePropertyMutationKey = (id: string) => ["properties", id, "update"] as const;

async function putProperty(id: string, input: UpdatePropertyInput): Promise<{ id: string }> {
  try {
    const res = await fetch(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Falha ao atualizar o imóvel");
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao atualizar o imóvel: ${error.message}`);
    }
    throw new Error("Erro desconhecido ao atualizar o imóvel");
  }
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updatePropertyMutationKey(id),
    mutationFn: (input: UpdatePropertyInput) => putProperty(id, input),
    onSuccess: async () => {
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: propertyQueryKey(id) }),
          queryClient.invalidateQueries({ queryKey: propertiesQueryKey() }),
        ]);
      } finally {
        toast.success("Imóvel atualizado com sucesso");
      }
    },
    onError: (error: Error) => {
      console.error("Erro na mutação de atualização de imóvel:", error);
      toast.error(error.message || "Erro ao atualizar o imóvel");
    },
  });
}
