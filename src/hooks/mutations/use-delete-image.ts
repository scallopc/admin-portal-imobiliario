import { useMutation } from "@tanstack/react-query";
import { deleteImage } from "@/actions/delete-image";
import { toast } from "sonner";

export function useDeleteImage() {
  return useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      toast.success("Imagem removida com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao remover a imagem.");
    },
  });
}
