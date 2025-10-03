"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useImportRelease } from '@/hooks/mutations/use-import-release';
import { useUpdateRelease } from '@/hooks/mutations/use-update-release';
import { useImageUpload } from '@/hooks/queries/use-image-upload';
import { useQueryClient } from '@tanstack/react-query';
import { releasesQueryKey } from '@/hooks/queries/use-releases';
import { DataTable } from '@/components/common/data-table';
import { ReleaseForm } from '@/components/common/release-form';

const mappingSchema = z.object({
  unit: z.string().min(1, "Unidade é obrigatório"),
  status: z.string().optional(),
  bedrooms: z.string().min(1, "Dormitórios é obrigatório"),
  parkingSpaces: z.string().optional(),
  privateArea: z.string().min(1, "Metragem é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
});

type MappingFormValues = z.infer<typeof mappingSchema>;

type ExcelImportFormProps = {
  columns: string[];
  items: Record<string, any>[];
  onCancel: () => void;
  description?: string;
};

export function ExcelImportForm({ columns, items, onCancel, description }: ExcelImportFormProps) {
  const queryClient = useQueryClient();
  const importMutation = useImportRelease();
  const updateReleaseMutation = useUpdateRelease();
  const [handleUpload] = useImageUpload();

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
  });

  const previewColumns = React.useMemo(() => {
    return (columns || []).map(c => ({
      key: c,
      header: c,
      cell: (row: Record<string, any>) => String(row[c] ?? ""),
    }));
  }, [columns]);

  const handleReleaseSubmit = async (releaseData: any) => {
    const toastId = toast.loading("Iniciando processo de importação...");

    try {
      const { images, floorPlans, city, neighborhood, ...restOfReleaseData } = releaseData;
      const mappingData = form.getValues();
      const normalizedUnits = items.map(row => {
        const parseNumber = (value: any) => {
          if (typeof value === 'number' && Number.isFinite(value)) return value;
          if (typeof value === 'string') {
            const s = String(value ?? "").replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
            const n = parseFloat(s);
            return Number.isFinite(n) ? n : undefined;
          }
          return undefined;
        };
        const rawStatus = mappingData.status ? String(row[mappingData.status] ?? "").trim() : "";
        const finalStatus = rawStatus || "disponivel";
        const rawVagas = mappingData.parkingSpaces ? row[mappingData.parkingSpaces] : undefined;
        const parsedVagas = mappingData.parkingSpaces ? parseNumber(rawVagas) : undefined;
        const finalVagas = parsedVagas === undefined || parsedVagas === ("" as any) ? "a consultar" : parsedVagas;

        return {
          unit: String(row[mappingData.unit] ?? ""),
          status: finalStatus,
          bedrooms: parseNumber(row[mappingData.bedrooms]),
          parkingSpaces: finalVagas,
          privateArea: parseNumber(row[mappingData.privateArea]),
          price: parseNumber(row[mappingData.price]),
          source: row,
        };
      });

      if (normalizedUnits.length === 0) {
        throw new Error("Nenhuma unidade válida encontrada na planilha.");
      }

      toast.loading("Criando empreendimento e unidades...", { id: toastId });
      const initialPayload = {
        release: {
          ...restOfReleaseData,
          address: { city, neighborhood },
          images: [],
          floorPlans: [],
        },
        units: normalizedUnits,
      };
      const { releaseId } = await importMutation.mutateAsync(initialPayload as any);

      const filesToUpload = (images || []).filter((img: any) => img instanceof File) as File[];
      let newImageUrls: string[] = [];
      if (filesToUpload.length > 0) {
        toast.loading("Enviando imagens...", { id: toastId });
        newImageUrls = await handleUpload(filesToUpload, releaseId);
      }

      const floorPlansToUpload = (floorPlans || []).filter((plan: any) => plan instanceof File) as File[];
      let newFloorPlanUrls: string[] = [];
      if (floorPlansToUpload.length > 0) {
        toast.loading("Enviando plantas...", { id: toastId });
        newFloorPlanUrls = await handleUpload(floorPlansToUpload, releaseId);
      }

      if (newImageUrls.length > 0 || newFloorPlanUrls.length > 0) {
        toast.loading("Finalizando...", { id: toastId });
        await updateReleaseMutation.mutateAsync({
          id: releaseId,
          images: newImageUrls,
          floorPlans: newFloorPlanUrls,
        });
      }

      await queryClient.invalidateQueries({ queryKey: releasesQueryKey() });
      toast.success("Importação concluída com sucesso!", { id: toastId });
      onCancel(); // Fecha o formulário de importação

    } catch (e: any) {
      toast.error(e?.message || "Falha ao importar", { id: toastId });
    }
  };

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
            isLoading={importMutation.isPending || updateReleaseMutation.isPending}
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
              form.setValue(field as any, value);
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
  );
}
