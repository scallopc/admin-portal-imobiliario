import { Button } from "@/components/ui/button";
import { useDeletePropertiesWithView } from "@/hooks/mutations/use-delete-properties-with-view";
import { Trash2 } from "lucide-react";

export function DeletePropertiesWithViewButton() {
  const { mutate: deletePropertiesWithView, isPending } = useDeletePropertiesWithView();

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja deletar todos os imóveis com propriedade 'views'? Esta ação não pode ser desfeita.")) {
      deletePropertiesWithView();
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isPending ? "Deletando..." : "Deletar Imóveis com 'views'"}
    </Button>
  );
}
