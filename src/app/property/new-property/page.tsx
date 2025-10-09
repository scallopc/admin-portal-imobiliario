"use client"

import PropertyForm, { type PropertyFormValues } from "@/app/property/components/property-form"
import { useCreateProperty } from "@/hooks/mutations/use-create-property";
import { useImageUpload } from "@/hooks/queries/use-image-upload";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import Title from "@/components/common/title"

export default function NewPropertyPage() {
  const router = useRouter();
  const createPropertyMutation = useCreateProperty();
  const [handleUpload, uploadState] = useImageUpload();

  const isProcessing = createPropertyMutation.isPending || uploadState.isUploading;

  async function handleSubmit(formData: PropertyFormValues) {
    const { images, floorPlans, ...propertyData } = formData;

    if (!images || images.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem.");
      return;
    }

    const toastId = toast.loading("Iniciando processo de criação...");

    const filesToUpload = (images || []).filter(img => img instanceof File) as File[];
    const existingImageUrls = (images || []).filter(img => typeof img === 'string') as string[];

    const floorPlansToUpload = (floorPlans || []).filter(plan => plan instanceof File) as File[];
    const existingFloorPlanUrls = (floorPlans || []).filter(plan => typeof plan === 'string') as string[];

    try {
      toast.loading("Criando imóvel...", { id: toastId });
      const { id: propertyId } = await createPropertyMutation.mutateAsync(propertyData);

      let newImageUrls: string[] = [];
      let newFloorPlanUrls: string[] = [];

      if (filesToUpload.length > 0 || floorPlansToUpload.length > 0) {
        toast.loading("Enviando imagens...", { id: toastId });
        if (filesToUpload.length > 0) {
          newImageUrls = await handleUpload(filesToUpload, propertyId);
        }
        if (floorPlansToUpload.length > 0) {
          newFloorPlanUrls = await handleUpload(floorPlansToUpload, propertyId);
        }
      }

      const finalImageUrls = [...existingImageUrls, ...newImageUrls];
      const finalFloorPlanUrls = [...existingFloorPlanUrls, ...newFloorPlanUrls];

      toast.loading("Finalizando...", { id: toastId });
      const updateResponse = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: finalImageUrls, floorPlans: finalFloorPlanUrls }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json().catch(() => ({}));
        throw new Error(error.message || "Falha ao atualizar o imóvel com as imagens");
      }

      toast.success("Imóvel criado com sucesso!", { id: toastId });
      router.push("/property");

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido";
      toast.error(errorMessage, { id: toastId });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Novo Imóvel" subtitle="Adicione um novo imóvel" />
      <PropertyForm onSubmit={handleSubmit} isSubmitting={isProcessing} submitText="Criar Imóvel" />
    </div>
  )
}
