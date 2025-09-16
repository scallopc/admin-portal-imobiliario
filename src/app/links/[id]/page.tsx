"use client"

import Title from "@/components/common/title"
import { useParams, useRouter } from "next/navigation"
import { useLink } from "@/hooks/queries/use-link"
import { useUpdateLink } from "@/hooks/mutations/use-update-link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createLinkSchema, type CreateLinkInput } from "@/actions/create-link/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function EditLinkPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const { data } = useLink(id)
  const { mutate: updateLink, isPending } = useUpdateLink(id)

  const form = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema as any),
    defaultValues: {
      type: data?.type ?? "Linktree",
      title: data?.title ?? "",
      url: data?.url ?? "",
    },
    values: data ? { type: data.type, title: data.title, url: data.url } : undefined,
  })

  const onSubmit = (values: CreateLinkInput) => {
    updateLink(values, {
      onSuccess: () => {
        toast.success("Link atualizado com sucesso")
        router.push("/links")
      },
      onError: (e: any) => toast.error(e?.message || "Falha ao atualizar link"),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Editar Link" subtitle="Atualize os dados do link" />
      <div className="bg-card text-card-foreground shadow-sm overflow-hidden rounded-lg p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Tipo</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Linktree">Linktree</SelectItem>
                        <SelectItem value="Google Drive">Google Drive</SelectItem>
                        <SelectItem value="Site">Site</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="url" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" disabled={isPending} onClick={() => router.push("/links")} variant="link">Cancelar</Button>
              <Button type="submit" variant="outline" disabled={isPending}>Salvar</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}


