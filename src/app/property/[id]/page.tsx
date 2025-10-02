"use client"

import { useState } from "react"
import { useProperty } from "@/hooks/queries/use-property"
import { useUpdateProperty } from "@/hooks/mutations/use-update-property"
import { useParams, useRouter } from "next/navigation"
import { Loading } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/error-state"
import Title from "@/components/common/title"
import PropertyForm, { PropertyFormValues } from "../components/property-form"

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading, error: fetchError } = useProperty(id)
  const { mutateAsync, isPending } = useUpdateProperty(id)

  async function handleSubmit(form: PropertyFormValues) {
    setError(null)
    try {
      await mutateAsync(form)
      // Redireciona para a lista após salvar com sucesso
      router.push('/property')
      router.refresh()
    } catch (error) {
      console.error('Erro ao atualizar imóvel:', error)
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o imóvel')
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
    description: data.description || undefined,
    propertyType: data.propertyType || undefined,
    status: data.status || "",
    price: data.price || 0,
    totalArea: data.totalArea || 0,
    privateArea: data.privateArea || 0,
    usefulArea: data.usefulArea || 0,
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    suites: data.suites || 0,
    suiteDetails: data.suiteDetails || "",
    parkingSpaces: data.parkingSpaces || 0,
    furnished: safeBoolean(data.furnished),
    address: {
      street: data.address?.street || "",
      number: data.address?.number || "",
      neighborhood: data.address?.neighborhood || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      zipCode: data.address?.zipCode || "",
      country: safeString(data.address?.country, 'Brasil'),
    },
    features: safeArray(data.features),
    images: safeArray(data.images),
    floorPlans: safeArray(data.floorPlans),
    videoUrl: data.videoUrl || "",
    virtualTourUrl: data.virtualTourUrl || "",
    seo: data.seo || "",
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
          defaultValues={defaults} 
          onSubmit={handleSubmit} 
          isSubmitting={isPending} 
        />
      )}
    </div>
  )
}
