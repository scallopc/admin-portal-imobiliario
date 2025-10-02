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
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/common/image-upload";
import { ChipAutocomplete } from "@/components/ui/chip-autocomplete";
import { propertyBaseSchema, addressSchema } from "@/schemas/property";
import { defaultNeighborhoods, propertyTypes, defaultValues, defaultFeatures } from "@/lib/constants";
import { useGenerateSEO } from "@/hooks/mutations/use-generate-seo";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { NumericFormat, PatternFormat } from "react-number-format";

const propertyFormSchema = z.object({
  ...propertyBaseSchema.shape,
  address: addressSchema,
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

type PropertyFormProps = {
  defaultValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
  isEdit?: boolean;
  onCancel?: () => void;
};

export function PropertyForm2({
  defaultValues: formDefaultValues,
  onSubmit,
  isLoading = false,
  submitText = "Salvar",
  isEdit = false,
  onCancel,
}: PropertyFormProps) {
  const generateSEOMutation = useGenerateSEO();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      propertyType: defaultValues.propertyType,
      layout: "",
      status: "Venda",
      price: 0,
      currency: "BRL",
      totalArea: 0,
      privateArea: 0,
      usefulArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      suites: 0,
      suiteDetails: "",
      parkingSpaces: 0,
      features: [],
      images: [],
      floorPlans: [],
      videoUrl: "",
      virtualTourUrl: "",
      seo: "",
      address: {
        city: defaultValues.city,
        street: "",
        neighborhood: defaultValues.neighborhood,
        number: "",
        state: "",
        zipCode: "",
        country: "Brasil",
      },
      ...formDefaultValues,
    },
  });

  const handleGenerateSEO = async () => {
    const description = form.getValues("description");

    if (!description) {
      toast.error("Adicione uma descrição primeiro para gerar o SEO");
      return;
    }

    try {
      const result = await generateSEOMutation.mutateAsync({ description });
      form.setValue("seo", result.seo);
      toast.success("SEO gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar SEO:", error);
      toast.error("Erro ao gerar SEO. Tente novamente.");
    }
  };

  const handleSubmit = async (values: PropertyFormValues) => {
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
                Título <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex: Apartamento 3 quartos com vista para o mar" {...field} />
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
                <Input placeholder="apartamento-3-quartos-vista-mar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de Imóvel <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Venda">Venda</SelectItem>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Cidade <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                    <SelectItem value="Niterói">Niterói</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Bairro <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>
                Descrição <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o imóvel em detalhes..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Preço <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  value={field.value}
                  onValueChange={values => field.onChange(values.floatValue || 0)}
                  placeholder="R$ 0,00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privateArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Área Privativa (m²) <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  suffix=" m²"
                  value={field.value}
                  onValueChange={values => field.onChange(values.floatValue || 0)}
                  placeholder="0 m²"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Dormitórios <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  value={field.value}
                  onValueChange={values => field.onChange(values.floatValue || 0)}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Banheiros <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  value={field.value}
                  onValueChange={values => field.onChange(values.floatValue || 0)}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Suítes <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  value={field.value}
                  onValueChange={values => field.onChange(values.floatValue || 0)}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parkingSpaces"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vagas de Garagem</FormLabel>
              <FormControl>
                <NumericFormat
                  customInput={Input}
                  value={field.value}
                  onValueChange={values => field.onChange(values.floatValue || 0)}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seo"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>SEO</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Textarea placeholder="Meta description para SEO..." className="min-h-[80px]" {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateSEO}
                  disabled={generateSEOMutation.isPending || isLoading}
                  className="self-start"
                >
                  {generateSEOMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar SEO"}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
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
          name="images"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>
                Imagens <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} />
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
              <FormLabel>Link do Vídeo</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/watch?v=..." {...field} />
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
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex justify-end gap-2 md:col-span-2">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                if (onCancel) {
                  onCancel();
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
