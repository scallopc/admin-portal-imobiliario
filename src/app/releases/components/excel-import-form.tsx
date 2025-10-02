"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useImportRelease } from '@/hooks/mutations/use-import-release'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { releasesQueryKey } from '@/hooks/queries/use-releases'
import { DataTable } from '@/components/common/data-table'
import { ReleaseForm } from '@/components/common/release-form'

const mappingSchema = z.object({
  unit: z.string().min(1, "Unidade é obrigatório"),
  status: z.string().optional(),
  bedrooms: z.string().min(1, "Dormitórios é obrigatório"),
  parkingSpaces: z.string().optional(),
  privateArea: z.string().min(1, "Metragem é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
})

type MappingFormValues = z.infer<typeof mappingSchema>

type ExcelImportFormProps = {
  columns: string[]
  items: Record<string, any>[]
  onCancel: () => void
  onSubmit?: (payload: { mapping: MappingFormValues; items: Record<string, any>[] }) => void
  description?: string
}

export function ExcelImportForm({ columns, items, onCancel, onSubmit, description }: ExcelImportFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const importMutation = useImportRelease()

  const form = useForm<MappingFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      unit: "",
      status: "",
      bedrooms: "",
      parkingSpaces: "",
      privateArea: "",
      price: "",
    },
  })

  const previewColumns = React.useMemo(() => {
    return (columns || []).map(c => ({
      key: c,
      header: c,
      cell: (row: Record<string, any>) => String(row[c] ?? ""),
    }))
  }, [columns])

  const handleSubmit = async (values: any) => {
    try {
      const parseNumber = (val: any) => {
        if (typeof val === 'number' && Number.isFinite(val)) return val
        if (typeof val === 'string') {
          const s = String(val ?? "")
            .replace(/\./g, "")
            .replace(/,/g, ".")
            .replace(/[^0-9.\-]/g, "")
          const n = parseFloat(s)
          return Number.isFinite(n) ? n : undefined
        }
        return undefined
      }

      const mapKey = {
        unit: values.unit,
        status: values.status,
        bedrooms: values.bedrooms,
        parkingSpaces: values.parkingSpaces,
        privateArea: values.privateArea,
        price: values.price,
      }

      const normalizedUnits = items.map(row => {
        const rawStatus = mapKey.status ? String(row[mapKey.status] ?? "").trim() : ""
        const finalStatus = rawStatus || "disponivel"

        const rawVagas = mapKey.parkingSpaces ? row[mapKey.parkingSpaces] : undefined
        const parsedVagas = mapKey.parkingSpaces ? parseNumber(rawVagas) : undefined
        const finalVagas = parsedVagas === undefined || parsedVagas === ("" as any) ? "a consultar" : parsedVagas

        const unit: Record<string, any> = {
          unit: String(row[mapKey.unit] ?? ""),
          status: finalStatus,
          bedrooms: parseNumber(row[mapKey.bedrooms]),
          parkingSpaces: finalVagas,
          privateArea: parseNumber(row[mapKey.privateArea]),
          price: parseNumber(row[mapKey.price]),
          source: row,
        }
        return unit
      })

      const payload = {
        release: values.release,
        units: normalizedUnits,
      }

      await importMutation.mutateAsync(payload)
      await queryClient.invalidateQueries({ queryKey: releasesQueryKey() })
      toast.success("Importação concluída")
      if (onSubmit) {
        onSubmit({} as any)
      }
    } catch (e: any) {
      toast.error(e?.message || "Falha ao importar")
    }
  }

  const handleReleaseSubmit = async (releaseData: any) => {
    // Estrutura os dados corretamente conforme o schema
    const mappingData = form.getValues()
    const structuredData = {
      // Dados de mapeamento (para as unidades)
      unit: mappingData.unit,
      status: mappingData.status,
      bedrooms: mappingData.bedrooms,
      parkingSpaces: mappingData.parkingSpaces,
      privateArea: mappingData.privateArea,
      price: mappingData.price,
      // Dados do release (estruturados corretamente)
      release: {
        title: releaseData.title,
        slug: releaseData.slug,
        description: releaseData.description,
        developer: releaseData.developer,
        status: releaseData.status,
        propertyType: releaseData.propertyType,
        seo: releaseData.seo,
        features: releaseData.features,
        images: releaseData.images,
        floorPlans: releaseData.floorPlans,
        videoUrl: releaseData.videoUrl,
        virtualTourUrl: releaseData.virtualTourUrl,
        address: {
          city: releaseData.city,
          neighborhood: releaseData.neighborhood
        }
      }
    }
    await handleSubmit(structuredData)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Empreendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <ReleaseForm
            defaultValues={{
              description: description || "",
            }}
            onSubmit={handleReleaseSubmit}
            isLoading={importMutation.isPending}
            submitText="Importar agora"
            isImport={true}
            columns={columns}
            mappingValues={{
              unit: form.watch("unit") || "",
              status: form.watch("status") || "",
              bedrooms: form.watch("bedrooms") || "",
              parkingSpaces: form.watch("parkingSpaces") || "",
              privateArea: form.watch("privateArea") || "",
              price: form.watch("price") || "",
            }}
            onMappingChange={(field, value) => {
              form.setValue(field as any, value)
            }}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Preview dos dados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={previewColumns} data={items} />
        </CardContent>
      </Card>
    </div>
  )
}
