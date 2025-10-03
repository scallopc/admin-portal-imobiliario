"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useReleaseDetails } from "@/hooks/queries/use-release-details";
import { useUpdateUnit } from "@/hooks/mutations/use-update-unit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable } from "@/components/common/data-table";
import { formatCurrency } from "@/lib/utils";
import Title from "@/components/common/title";
import { useUpdateRelease } from "@/hooks/mutations/use-update-release";
import { useImageUpload } from '@/hooks/queries/use-image-upload';
import { defaultValues } from "@/lib/constants";
import { ReleaseForm } from "@/components/common/release-form";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

type Props = { id: string };

export default function ReleaseDetailsClient({ id }: Props) {
  const router = useRouter();
  const { data, isLoading, error } = useReleaseDetails(id);
  const updateUnit = useUpdateUnit(id);
  const [editing, setEditing] = React.useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = React.useState<Record<string, any>>({});
  const updateRelease = useUpdateRelease();
  const [handleUpload] = useImageUpload();

  const onEdit = (unitId: string, row: any) => {
    setEditing(s => ({ ...s, [unitId]: true }));
    setDrafts(s => ({ ...s, [unitId]: { status: row.status ?? "" } }));
  };

  const onCancel = (unitId: string) => {
    setEditing(s => ({ ...s, [unitId]: false }));
    setDrafts(s => {
      const { [unitId]: _, ...rest } = s;
      return rest;
    });
  };

  const onChange = (unitId: string, key: "status", value: string) => {
    setDrafts(s => ({ ...s, [unitId]: { ...(s[unitId] || {}), [key]: value } }));
  };

  const onSave = async (unitId: string) => {
    try {
      const d = drafts[unitId];
      const payload: Record<string, any> = { status: d?.status ? d.status : "disponivel" };
      await updateUnit.mutateAsync(
        { releaseId: id, unitId, data: payload },
        {
          onSuccess: () => {
            toast.success("Unidade atualizada");
            onCancel(unitId);
          },
          onError: (e: any) => {
            toast.error(e?.message || "Falha ao atualizar unidade");
          },
        }
      );
    } catch (e: any) {
      toast.error(e?.message || "Ocorreu um erro inesperado");
    }
  };

  const handleReleaseSubmit = async (values: any) => {
    try {
      const { images, floorPlans, city, neighborhood, ...rest } = values;

      // Lida com upload de novas imagens
      const existingImageUrls = (images || []).filter((i: any) => typeof i === 'string');
      const newImageFiles = (images || []).filter((i: any) => i instanceof File);
      let newImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        newImageUrls = await handleUpload(newImageFiles, id);
      }

      // Lida com upload de novas plantas
      const existingFloorPlanUrls = (floorPlans || []).filter((i: any) => typeof i === 'string');
      const newFloorPlanFiles = (floorPlans || []).filter((i: any) => i instanceof File);
      let newFloorPlanUrls: string[] = [];
      if (newFloorPlanFiles.length > 0) {
        newFloorPlanUrls = await handleUpload(newFloorPlanFiles, id);
      }

      const payload = {
        id,
        ...rest,
        images: [...existingImageUrls, ...newImageUrls],
        floorPlans: [...existingFloorPlanUrls, ...newFloorPlanUrls],
        address: { city, neighborhood },
      };

      await updateRelease.mutateAsync(payload);
      toast.success("Empreendimento atualizado");
      router.push("/releases");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao atualizar empreendimento");
    }
  };

  const release = data;
  const units = data?.units || [];

  const unitColumns = [
    {
      key: "unit",
      header: "Unidade",
      cell: (row: any) => row.unit || "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (row: any) => {
        const isEditing = editing[row.id];
        if (isEditing) {
          return (
            <Select
              value={drafts[row.id]?.status || row.status || ""}
              onValueChange={value => onChange(row.id, "status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="em negociação">Em negociação</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        return (
          <Badge
            variant={row.status === "vendido" ? "destructive" : row.status === "reservado" ? "secondary" : "default"}
          >
            {row.status || "Disponível"}
          </Badge>
        );
      },
    },
    {
      key: "bedrooms",
      header: "Dormitórios",
      cell: (row: any) => row.bedrooms || "-",
    },
    {
      key: "parkingSpaces",
      header: "Vagas",
      cell: (row: any) => row.parkingSpaces || "-",
    },
    {
      key: "privateArea",
      header: "Área (m²)",
      cell: (row: any) => (row.privateArea ? `${row.privateArea} m²` : "-"),
    },
    {
      key: "price",
      header: "Preço",
      cell: (row: any) => (row.price ? formatCurrency(row.price) : "-"),
    },
    {
      key: "actions",
      header: "Ações",
      cell: (row: any) => {
        const isEditing = editing[row.id];
        if (isEditing) {
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onSave(row.id)}>
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCancel(row.id)}>
                Cancelar
              </Button>
            </div>
          );
        }
        return (
          <Button size="sm" variant="outline" onClick={() => onEdit(row.id, row)}>
            Editar
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title={release?.title || "Empreendimento"} subtitle="Gerencie as unidades do empreendimento" />

      {isLoading && <Loading message="Carregando empreendimento..." />}

      {(error || (!isLoading && !data)) && (
        <ErrorState
          title="Erro ao carregar empreendimento"
          message="Não foi possível carregar os dados do empreendimento."
          error={error}
        />
      )}

      {!isLoading && data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Empreendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ReleaseForm
                defaultValues={{
                  title: data?.title || "",
                  slug: data?.slug || "",
                  description: data?.description || "",
                  developer: data?.developer || "",
                  status: data?.status || defaultValues.releaseStatus,
                  city: data?.address?.city || defaultValues.city,
                  neighborhood: data?.address?.neighborhood || defaultValues.neighborhood,
                  propertyType: data?.propertyType || defaultValues.propertyType,
                  images: Array.isArray(data?.images) ? data.images : [],
                  floorPlans: Array.isArray(data?.floorPlans) ? data.floorPlans : [],
                  seo: data?.seo || "",
                  features: Array.isArray(data?.features) ? data.features : [],
                  videoUrl: data?.videoUrl || "",
                  virtualTourUrl: data?.virtualTourUrl || "",
                }}
                onSubmit={handleReleaseSubmit}
                isLoading={updateRelease.isPending}
                submitText="Salvar alterações"
                isEdit={true}
              />
            </CardContent>
          </Card>

          <DataTable columns={unitColumns} data={units} />
        </>
      )}
    </div>
  );
}
