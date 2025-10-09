"use client"

import { useForm, type SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PatternFormat } from "react-number-format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodPtBrErrorMap } from "@/lib/zod-ptbr-error-map"
import { createLeadSchema, type CreateLeadInput } from "@/actions/create-lead/schema"
import { sourceLead, statusLead } from "@/lib/constants"
import { useRouter } from "next/navigation"

z.setErrorMap(zodPtBrErrorMap)

export type LeadFormData = CreateLeadInput;

type Props = {
  defaultValues?: Partial<CreateLeadInput>
  onSubmit: SubmitHandler<CreateLeadInput>
  isSubmitting: boolean
  resetOnSuccess?: boolean
}

export default function LeadForm({ defaultValues, onSubmit, isSubmitting, resetOnSuccess = true }: Props) {
  const router = useRouter()
  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema as any),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "Novo" as const,
      source: "JadeChat" as const,
      notes: "",
      ...defaultValues,
    },
    mode: "onChange",
  })

  const onValid: SubmitHandler<CreateLeadInput> = async (data) => {
    await onSubmit(data)
    if (resetOnSuccess) form.reset()
      router.push("/leads")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Nome</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">E-mail</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Telefone</FormLabel>
              <FormControl>
                <PatternFormat
                  format="(##) #####-####"
                  mask="_"
                  value={field.value}
                  onValueChange={(v) => field.onChange(v.formattedValue)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField name="status" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {statusLead.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="source" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Origem</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {sourceLead.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField name="notes" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel className="mb-2">Notas</FormLabel>
            <FormControl><Textarea rows={5} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

<div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => router.push('/leads')}
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
