"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { NumericFormat, PatternFormat } from "react-number-format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCepQuery } from "@/hooks/queries/use-cep"
import { Loader2 } from "lucide-react"
import { zodPtBrErrorMap } from "@/lib/zod-ptbr-error-map"
import { ImageUpload } from "@/components/common/image-upload"
import { propertySchema, addressSchema, type PropertyInput } from "@/schemas/property"

z.setErrorMap(zodPtBrErrorMap)

export type PropertyFormData = PropertyInput;

type Props = {
    defaultValues?: Partial<PropertyInput>
    onSubmit: SubmitHandler<PropertyInput>
    isSubmitting: boolean
    resetOnSuccess?: boolean
}

export default function PropertyForm({
    defaultValues,
    onSubmit,
    isSubmitting,
    resetOnSuccess = true
}: Props) {
    const router = useRouter()

    // Função para garantir que arrays sejam sempre arrays
    const safeArray = <T,>(arr: T[] | undefined): T[] => Array.isArray(arr) ? arr : [];

    // Função para garantir que objetos tenham um valor padrão
    const safeObject = <T extends object>(obj: T | undefined, defaultValue: T): T =>
        obj && Object.keys(obj).length > 0 ? obj : defaultValue;

    // Prepara os valores padrão com fallbacks
    const defaultValuesWithFallback = useMemo(() => {
        const defaults: PropertyFormData = {
            title: "",
            description: "",
            type: undefined,
            status: undefined,
            price: undefined,
            currency: "BRL",
            area: undefined,
            bedrooms: undefined,
            bathrooms: undefined,
            suites: undefined,
            parkingSpaces: undefined,
            address: {
                street: "",
                number: "",
                neighborhood: "",
                city: "",
                state: "",
                zipCode: "",
                country: "Brasil"
            },
            images: [],
            videos: [],
            keywords: [],
            furnished: false,
            features: [],
            listedBy: undefined
        };

        if (!defaultValues) return defaults;

        return {
            ...defaults,
            ...defaultValues,
            address: {
                ...defaults.address,
                ...(defaultValues.address || {})
            },
            images: safeArray(defaultValues.images),
            videos: safeArray(defaultValues.videos),
            keywords: safeArray(defaultValues.keywords)
        };
    }, [defaultValues]);

    const form = useForm<PropertyInput>({
        resolver: zodResolver(propertySchema as any),
        defaultValues: defaultValuesWithFallback as unknown as PropertyInput,
        mode: "onChange"
    });

    const zipMasked = form.watch("address.zipCode") || ""
    const zipDigits = zipMasked.replace(/\D/g, "")
    const { data: cepData, isFetching: isCepLoading, isError: isCepError, error: cepError } = useCepQuery(zipDigits, { enabled: zipDigits.length === 8 })

    const cepNotFound = Boolean(isCepError && cepError && cepError.message === "CEP não encontrado")

    useEffect(() => {
        if (!cepData) return

        form.setValue("address.street", cepData.street || "", { shouldDirty: true, shouldValidate: true })
        form.setValue("address.neighborhood", cepData.neighborhood || "", { shouldDirty: true, shouldValidate: true })
        form.setValue("address.city", cepData.city || "", { shouldDirty: true, shouldValidate: true })
        form.setValue("address.state", cepData.state || "", { shouldDirty: true, shouldValidate: true })
        form.setValue("address.country", cepData.country || "Brasil", { shouldDirty: true, shouldValidate: true })

        if (zipDigits.length === 8) {
            const masked = `${zipDigits.slice(0, 5)}-${zipDigits.slice(5)}`
            form.setValue("address.zipCode", masked, { shouldDirty: true, shouldValidate: true })
        }
    }, [cepData, form, zipDigits])

    

    const zipFieldErrorMessage = (form.formState.errors as any)?.address?.zipCode?.message as string | undefined

    useEffect(() => {
        if (cepNotFound) {
            form.setError("address.zipCode", { type: "manual", message: "CEP não encontrado" })
            return
        }
        if (zipFieldErrorMessage === "CEP não encontrado") {
            form.clearErrors("address.zipCode")
        }
    }, [cepNotFound, form, zipFieldErrorMessage])

    const onValid: SubmitHandler<PropertyInput> = async (data) => {
        try {
            await onSubmit(data)
            if (resetOnSuccess) form.reset()
        } catch (error) {
            console.error('Erro ao salvar o imóvel:', error)
            if (error instanceof Error) {
                alert(`Erro ao salvar: ${error.message}`)
            } else {
                alert('Ocorreu um erro inesperado ao salvar o imóvel')
            }
        }
    }

    const videos = form.watch("videos") || []

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <FormField
                            name="title"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="mb-2">
                                        Título <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="mb-2">Tipo</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Casa">Casa</SelectItem>
                                            <SelectItem value="Apartamento">Apartamento</SelectItem>
                                            <SelectItem value="Penthouse">Penthouse</SelectItem>
                                            <SelectItem value="Cobertura">Cobertura</SelectItem>
                                            <SelectItem value="Sobrado">Sobrado</SelectItem>
                                            <SelectItem value="Kitnet">Kitnet</SelectItem>
                                            <SelectItem value="Studio">Studio</SelectItem>
                                            <SelectItem value="Terreno">Terreno</SelectItem>
                                            <SelectItem value="Comercial">Comercial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="mb-2">Status</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Venda">Venda</SelectItem>
                                            <SelectItem value="Aluguel">Aluguel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="furnished"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-start gap-2 space-y-0">
                                <FormLabel className="text-sm font-medium">Mobiliado</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <FormField name="price" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Preço</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    value={field.value || ""}
                                    onValueChange={(v) => field.onChange(v.floatValue || undefined)}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    allowNegative={false}
                                    decimalScale={2}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="area" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Área (m²)</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    value={field.value || ""}
                                    onValueChange={(v) => field.onChange(v.floatValue || undefined)}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    allowNegative={false}
                                    decimalScale={0}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="bedrooms" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Quartos</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    value={field.value || ""}
                                    onValueChange={(v) => field.onChange(v.floatValue || undefined)}
                                    allowNegative={false}
                                    decimalScale={0}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="bathrooms" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Banheiros</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    value={field.value || ""}
                                    onValueChange={(v) => field.onChange(v.floatValue || undefined)}
                                    allowNegative={false}
                                    decimalScale={0}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="suites" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Suítes</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    value={field.value || ""}
                                    onValueChange={(v) => field.onChange(v.floatValue || undefined)}
                                    allowNegative={false}
                                    decimalScale={0}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="parkingSpaces" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Vagas</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    value={field.value || ""}
                                    onValueChange={(v) => field.onChange(v.floatValue || undefined)}
                                    allowNegative={false}
                                    decimalScale={0}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>



                <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="mb-2">Descrição</FormLabel>
                        <FormControl><Textarea rows={5} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField name="keywords" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="mb-2">Palavras-chave (SEO)</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                placeholder="Ex: apartamento, vista mar, 2 quartos, piscina..."
                                value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                                onChange={(e) => {
                                    const keywords = e.target.value
                                        .split(",")
                                        .map(k => k.trim())
                                        .filter(k => k.length > 0);
                                    field.onChange(keywords);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                            Separe as palavras-chave por vírgula. Ex: apartamento, vista mar, 2 quartos
                        </p>
                    </FormItem>
                )} />

                <div className="space-y-2">
                    <FormLabel>Imagens do Imóvel</FormLabel>
                    <FormField
                        name="images"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        maxFiles={20}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>



                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="address.zipCode" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">CEP</FormLabel>
                            <FormControl>
                                <PatternFormat
                                    format="#####-###"
                                    mask="_"
                                    value={field.value}
                                    onValueChange={(v) => field.onChange(v.formattedValue)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="address.street" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Rua</FormLabel>
                            <FormControl><Input disabled placeholder={isCepLoading ? "Carregando..." : undefined} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="address.number" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Número</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="address.neighborhood" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Bairro</FormLabel>
                            <FormControl><Input disabled placeholder={isCepLoading ? "Carregando..." : undefined} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="address.city" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Cidade</FormLabel>
                            <FormControl><Input disabled placeholder={isCepLoading ? "Carregando..." : undefined} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="address.state" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Estado</FormLabel>
                            <FormControl><Input disabled placeholder={isCepLoading ? "Carregando..." : undefined} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => router.push('/property')}
                        variant="link"
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="outline" disabled={isSubmitting}>Salvar</Button>
                </div>

            </form>

        </Form>
    )
}
