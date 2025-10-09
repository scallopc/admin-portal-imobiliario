"use client"

import { useState } from "react"
import { useProperty } from "@/hooks/queries/use-property"
import { useUpdateProperty } from "@/hooks/mutations/use-update-property";
import { useImageUpload } from "@/hooks/queries/use-image-upload";
import { useParams, useRouter } from "next/navigation"
import { Loading } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/error-state"
import Title from "@/components/common/title";
import { toast } from "sonner";
import PropertyForm, { PropertyFormValues } from "../components/property-form"

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const [error, setError] = useState<string | null>(null);
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
  const { data, isLoading, error: fetchError } = useProperty(id)
  const { mutateAsync, isPending: isUpdatePending } = useUpdateProperty(id);
  const [handleUpload, uploadState] = useImageUpload();

  const isProcessing = isUpdatePending || uploadState.isUploading;

  const handleRemoveUrl = (url: string) => {
    setUrlsToDelete(prev => [...prev, url]);
  };

  async function handleSubmit(form: PropertyFormValues) {
    setError(null);
    const { images, floorPlans, ...propertyData } = form;

    const toastId = toast.loading("Iniciando atualização...");

    try {
      const filesToUpload = (images || []).filter(img => img instanceof File) as File[];
      const existingImageUrls = (images || []).filter(img => typeof img === 'string') as string[];

      const floorPlansToUpload = (floorPlans || []).filter(plan => plan instanceof File) as File[];
      const existingFloorPlanUrls = (floorPlans || []).filter(plan => typeof plan === 'string') as string[];

      let newImageUrls: string[] = [];
      let newFloorPlanUrls: string[] = [];

      if (filesToUpload.length > 0 || floorPlansToUpload.length > 0) {
        toast.loading("Enviando novas imagens...", { id: toastId });
        if (filesToUpload.length > 0) {
          newImageUrls = await handleUpload(filesToUpload, id);
        }
        if (floorPlansToUpload.length > 0) {
          newFloorPlanUrls = await handleUpload(floorPlansToUpload, id);
        }
      }

      const finalImages = [...existingImageUrls, ...newImageUrls];
      const finalFloorPlans = [...existingFloorPlanUrls, ...newFloorPlanUrls];

      toast.loading("Salvando alterações...", { id: toastId });
      await mutateAsync({
        urlsToDelete, // Envia as URLs para deletar
        ...propertyData,
        images: finalImages,
        floorPlans: finalFloorPlans,
      });

      toast.success("Imóvel atualizado com sucesso!", { id: toastId });
      router.push('/property');
      router.refresh();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o imóvel';
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    }
  }

  // Função para garantir que arrays sejam sempre arrays e nunca undefined
  const safeArray = <T,>(arr: T[] | undefined): T[] => Array.isArray(arr) ? arr : [];

  // Função para garantir que números tenham um valor padrão
  const safeNumber = (num: number | undefined, defaultValue = 0): number => 
    typeof num === 'number' && !isNaN(num) ? num : defaultValue;

  // Função para garantir que strings tenham um valor padrão
  const safeString = (str: string | undefined, defaultValue = ''): string =>
    typeof str === 'string' ? str : defaultValue;

  // Função para garantir que booleanos tenham um valor padrão
  const safeBoolean = (bool: boolean | undefined, defaultValue = false): boolean =>
    typeof bool === 'boolean' ? bool : defaultValue;

  const defaults: PropertyFormValues | null = data ? {
    title: safeString(data.title),
    slug: safeString(data.slug),
    description: safeString(data.description),
    propertyType: safeString(data.propertyType, 'Apartamento'),
    status: safeString(data.status, 'Venda'),
    price: safeString(String(data.price)),
    totalArea: safeNumber(data.totalArea),
    privateArea: safeNumber(data.privateArea),
    usefulArea: safeNumber(data.usefulArea),
    bedrooms: safeNumber(data.bedrooms),
    bathrooms: safeNumber(data.bathrooms),
    suites: safeNumber(data.suites),
    suiteDetails: safeString(data.suiteDetails),
    parkingSpaces: safeNumber(data.parkingSpaces),
    furnished: safeBoolean(data.furnished),
    highlight: safeBoolean(data.highlight),
    address: {
      street: safeString(data.address?.street),
      number: safeString(data.address?.number),
      neighborhood: safeString(data.address?.neighborhood),
      city: safeString(data.address?.city, 'Rio de Janeiro'),
      state: safeString(data.address?.state),
      zipCode: safeString(data.address?.zipCode),
      country: safeString(data.address?.country, 'Brasil'),
    },
    features: safeArray(data.features),
    images: safeArray(data.images as any),
    floorPlans: safeArray(data.floorPlans as any),
    videoUrl: safeString(data.videoUrl),
    virtualTourUrl: safeString(data.virtualTourUrl),
    seo: safeString(data.seo),
  } : null

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Editar Imóvel" subtitle="Edite um imóvel" />
      
      {isLoading && (
        <Loading message="Carregando imóvel..." />
      )}

      {(fetchError || (!isLoading && !data)) && (
        <ErrorState 
          title="Erro ao carregar imóvel"
          message="Não foi possível carregar os dados do imóvel."
          error={fetchError}
        />
      )}

      {error && (
        <ErrorState 
          title="Erro ao salvar"
          message="Não foi possível salvar as alterações."
          error={error}
          showRetry={false}
        />
      )}
      
      {!isLoading && data && defaults && (
        <PropertyForm
          onRemoveUrl={handleRemoveUrl} // Passa a função para o formulário 
          defaultValues={defaults} 
          onSubmit={handleSubmit} 
          isSubmitting={isProcessing} 
        />
      )}
    </div>
  )
}
