"use client"

import { useState } from "react"
import PropertyForm, { type PropertyFormData } from "@/app/property/components/property-form"
import { useProperty } from "@/hooks/queries/use-property"
import { useUpdateProperty } from "@/hooks/mutations/use-update-property"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Title from "@/components/common/title"

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading, error: fetchError } = useProperty(id)
  const { mutateAsync, isPending } = useUpdateProperty(id)

  async function handleSubmit(form: PropertyFormData) {
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

  const defaults: PropertyFormData | null = data ? {
    title: safeString(data.title),
    description: data.description || undefined,
    type: data.type || undefined,
    status: data.status || undefined,
    price: data.price || undefined,
    currency: safeString(data.currency, 'BRL'),
    area: data.area || undefined,
    bedrooms: data.bedrooms || undefined,
    bathrooms: data.bathrooms || undefined,
    suites: data.suites || undefined,
    parkingSpaces: data.parkingSpaces || undefined,
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
    coordinates: data.coordinates || undefined,
    features: safeArray(data.features),
    images: safeArray(data.images),
    videos: safeArray(data.videos),
    keywords: safeArray(data.keywords)
  } : null

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Editar Imóvel" subtitle="Edite um imóvel" />
      
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando dados do imóvel...</span>
        </div>
      )}

      {(fetchError || (!isLoading && !data)) && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p>Não foi possível carregar os dados do imóvel.</p>
          {fetchError && <p className="mt-2 text-sm">{String(fetchError)}</p>}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p>{error}</p>
        </div>
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
