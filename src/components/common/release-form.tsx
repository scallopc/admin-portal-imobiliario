"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/common/image-upload";
import {
  defaultNeighborhoods,
  propertyTypes,
  releaseStatuses,
  cities,
  defaultValues,
  defaultFeatures,
} from "@/lib/constants";
import { ChipAutocomplete } from "@/components/ui/chip-autocomplete";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { useImproveAll } from "@/hooks/mutations/use-improve-all";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const baseReleaseFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().min(1, "Descrição é obrigatória"),
  developer: z.string().optional(),
  status: z.string().min(1, "Status do lançamento é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  propertyType: z.string().min(1, "Tipo de imóvel é obrigatório"),
  images: z.array(z.union([z.string().url(), z.instanceof(File)])).min(1, "Pelo menos uma imagem é obrigatória"),
  floorPlans: z.array(z.union([z.string().url(), z.instanceof(File)])).optional(),
  seo: z.string().optional(),
  features: z.array(z.string()).min(1, "Características são obrigatórias"),
  videoUrl: z.string().url().optional().or(z.literal("")),
  virtualTourUrl: z.string().url().optional().or(z.literal("")),
  delivery: z.string().min(1, "Data de entrega é obrigatória"),
});

const mappingSchema = z.object({
  unit: z.string().min(1, "Unidade é obrigatório"),
  unitStatus: z.string().optional(),
  bedrooms: z.string().min(1, "Dormitórios é obrigatório"),
  parkingSpaces: z.string().optional(),
  privateArea: z.string().min(1, "Metragem é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
});

const createReleaseFormSchema = (isImport: boolean) => {
  if (isImport) {
    return baseReleaseFormSchema.merge(mappingSchema);
  }
  return baseReleaseFormSchema;
};

type ReleaseFormValues = z.infer<typeof baseReleaseFormSchema> & {
  unit?: string;
  unitStatus?: string;
  bedrooms?: string;
  parkingSpaces?: string;
  privateArea?: string;
  price?: string;
  delivery?: string;
};

type ReleaseFormProps = {
  defaultValues?: Partial<ReleaseFormValues>;
  onSubmit: (values: ReleaseFormValues) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
  isEdit?: boolean;
  isImport?: boolean;
  columns?: string[];
  mappingValues?: {
    unit: string;
    status: string;
    bedrooms: string;
    parkingSpaces: string;
    privateArea: string;
    price: string;
  };
  onMappingChange?: (field: string, value: string) => void;
  onCancel?: () => void;
};

export function ReleaseForm({
  defaultValues: formDefaultValues,
  onSubmit,
  isLoading = false,
  submitText = "Salvar",
  isEdit = false,
  isImport = false,
  columns = [],
  mappingValues,
  onMappingChange,
  onCancel,
}: ReleaseFormProps) {
  const improveAllMutation = useImproveAll();
  const router = useRouter();

  const form = useForm<ReleaseFormValues>({
    resolver: zodResolver(createReleaseFormSchema(isImport)),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      developer: "",
      status: defaultValues.releaseStatus,
      city: defaultValues.city,
      neighborhood: defaultValues.neighborhood,
      propertyType: defaultValues.propertyType,
      images: [],
      floorPlans: [],
      seo: "",
      features: [],
      videoUrl: "",
      virtualTourUrl: "",
      delivery: new Date().toISOString(),
      // Campos de mapeamento (apenas para importação)
      ...(isImport && {
        unit: "",
        unitStatus: "",
        bedrooms: "",
        parkingSpaces: "",
        privateArea: "",
        price: "",
      }),
      ...formDefaultValues,
    },
  });

  const handleImproveAll = async () => {
    const description = form.getValues("description");

    if (!description) {
      toast.error("Adicione uma descrição primeiro para melhorar com IA");
      return;
    }

    try {
      const result = await improveAllMutation.mutateAsync({
        description,
      });

      // Atualizar todos os campos
      form.setValue("description", result.improvedDescription);
      form.setValue("title", result.title);
      form.setValue("slug", result.slug);
      form.setValue("seo", result.seo);

      toast.success("Todos os campos foram otimizados com IA!");
    } catch (error) {
      console.error("Erro ao melhorar com IA:", error);
      toast.error("Erro ao melhorar com IA. Tente novamente.");
    }
  };

  const handleSubmit = async (values: ReleaseFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Título do Empreendimento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex.: GREEN VIEW" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Slug <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex.: green-view" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="developer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Construtora</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da construtora" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delivery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Entrega <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <MonthYearPicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={date => field.onChange(date?.toISOString())}
                    placeholder="Selecione mês e ano de entrega"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status do Lançamento <span className="text-red-500">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {releaseStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de Imóvel <span className="text-red-500">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cidade <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Bairro <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {defaultNeighborhoods.map(neighborhood => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <FormLabel>
                  Descrição do Empreendimento <span className="text-red-500">*</span>
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImproveAll}
                  disabled={improveAllMutation.isPending}
                  className="text-xs"
                >
                  {improveAllMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Otimizando...
                    </>
                  ) : (
                    "🤖 Otimizar Tudo com IA"
                  )}
                </Button>
              </div>
              <FormControl>
                <Textarea rows={6} placeholder="Descrição detalhada do empreendimento..." {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-muted-foreground text-sm">
                Clique em "Otimizar Tudo com IA" para melhorar a descrição, gerar título, slug e SEO automaticamente
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO (Meta Description)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite uma descrição otimizada para SEO (máximo 160 caracteres)"
                  value={field.value || ""}
                  onChange={field.onChange}
                  maxLength={160}
                />
              </FormControl>
              <FormMessage />
              <p className="text-muted-foreground text-sm">{field.value?.length || 0}/160 caracteres</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Características <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <ChipAutocomplete
                  value={field.value || []}
                  onChange={field.onChange}
                  suggestions={defaultFeatures}
                  placeholder="Digite uma característica..."
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do Vídeo (YouTube)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="virtualTourUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do Tour Virtual</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Imagens do Empreendimento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <ImageUpload value={(field.value as any[]) || []} onChange={field.onChange} onBlur={field.onBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="floorPlans"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagens das Plantas</FormLabel>
              <FormControl>
                <ImageUpload value={(field.value as any[]) || []} onChange={field.onChange} onBlur={field.onBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isImport && (
          <div className="md:col-span-2">
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Mapear colunas do Excel</h3>
              <div className="grid grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>
                        Unidade <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            onMappingChange?.("unit", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a coluna" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitStatus"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            onMappingChange?.("status", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a coluna" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>
                        Dormitórios <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            onMappingChange?.("bedrooms", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a coluna" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parkingSpaces"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>Vagas</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            onMappingChange?.("parkingSpaces", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a coluna" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privateArea"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>
                        Metragem (m²) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            onMappingChange?.("privateArea", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a coluna" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>
                        Preço <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={value => {
                            field.onChange(value);
                            onMappingChange?.("price", value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a coluna" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map(c => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2 md:col-span-2">
          {(isEdit || isImport) && (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                if (isImport && onCancel) {
                  onCancel();
                } else if (isEdit) {
                  router.push("/releases");
                }
              }}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="from-accent to-accent/90 hover:from-accent/90 hover:to-accent transform rounded-lg bg-gradient-to-r px-6 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
