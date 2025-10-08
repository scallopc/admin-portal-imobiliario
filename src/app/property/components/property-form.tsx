"use client";
import { ImageUpload } from "@/components/common/image-upload";
import { ChipAutocomplete } from "@/components/ui/chip-autocomplete";
import { propertyBaseSchema, addressSchema } from "@/schemas/property";
import { defaultNeighborhoods, propertyTypes, defaultValues, defaultFeatures, statusProperty } from "@/lib/constants";
import { useGenerateSEO } from "@/hooks/mutations/use-generate-seo";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useImproveAll } from "@/hooks/mutations/use-improve-all";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";

const propertyFormSchema = propertyBaseSchema;

export type PropertyFormValues = z.infer<typeof propertyFormSchema> & {
  highlight: boolean;
};

type PropertyFormProps = {
  defaultValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  onRemoveUrl?: (url: string) => void; // Nova prop
  isSubmitting?: boolean;
  submitText?: string;
  isEdit?: boolean;
  onCancel?: () => void;
  propertyId?: string;
};

export default function PropertyForm({
  defaultValues,
  onSubmit,
  onRemoveUrl, // Nova prop
  isSubmitting = false,
  submitText = "Salvar",
  isEdit = false,
  propertyId: initialPropertyId,
}: PropertyFormProps) {
  const router = useRouter();
  const improveAllMutation = useImproveAll();
  const [propertyId, setPropertyId] = useState(initialPropertyId || "");

  useEffect(() => {
    if (!isEdit && !initialPropertyId) {
      setPropertyId(uuidv4());
    }
  }, [isEdit, initialPropertyId]);
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      propertyType: defaultValues?.propertyType || "Apartamento",
      status: defaultValues?.status || "Venda",
      price: "",
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
      highlight: false,
      address: {
        city: defaultValues?.address?.city || "Rio de Janeiro",
        street: "",
        neighborhood: defaultValues?.address?.neighborhood || "Barra da Tijuca",
        number: "",
        state: "",
        zipCode: "",
        country: "Brasil",
      },
      ...defaultValues,
    },
  });

  const formatPrice = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    // Converte para número e formata
    const number = parseInt(numbers, 10);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number / 100);
  };

  const handlePriceChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatPrice(value);
    onChange(formatted);
  };

  const handleSubmit = async (values: PropertyFormValues) => {
    try {
      // Verificar se o formulário é válido
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      await onSubmit(values);
      router.push(`/property`);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar. Verifique os dados e tente novamente.");
    }
  };

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-4">
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

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Preço <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value}
                    onChange={e => handlePriceChange(e.target.value, field.onChange)}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="furnished"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base">Mobiliado?</FormLabel>

                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="highlight"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base">Destacar Imóvel</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">Máximo 6 imóveis em destaque</p>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusProperty.map(status => (
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
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <SelectTrigger className="w-full">
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <FormLabel>
                  Descrição <span className="text-red-500">*</span>
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
                <Textarea placeholder="Descreva o imóvel em detalhes..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-4">
          <FormField
            control={form.control}
            name="privateArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Área Privativa (m²) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Total (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usefulArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Área Útil (m²) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
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
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Dormitórios <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
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
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
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
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="suiteDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalhes das Suítes</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 1 suíte master com closet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Imagens <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <ImageUpload
                  value={(field.value as any[]) || []}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onRemoveUrl={onRemoveUrl}
                />
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
                <ImageUpload
                  value={(field.value as any[]) || []}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onRemoveUrl={onRemoveUrl}
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
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              router.back();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="from-accent to-accent/90 hover:from-accent/90 hover:to-accent transform rounded-lg bg-gradient-to-r px-6 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
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
