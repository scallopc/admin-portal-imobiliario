"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createLinkSchema, type CreateLinkInput } from "@/actions/create-link/schema"
import { useCreateLink } from "@/hooks/mutations/use-create-link"
import { toast } from "sonner"

type Props = {
  defaultValues?: Partial<CreateLinkInput>
}

export default function LinkForm({ defaultValues }: Props) {
  const router = useRouter()
  const { mutate: createLink, isPending } = useCreateLink()

  const form = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema as any),
    defaultValues: {
      type: "Linktree",
      title: "",
      url: "",
      ...defaultValues,
    },
    mode: "onChange",
  })

  const onValid: SubmitHandler<CreateLinkInput> = (data) => {
    createLink(data, {
      onSuccess: () => {
        toast.success("Link criado com sucesso")
        router.push("/links")
      },
      onError: (e: any) => toast.error(e?.message || "Falha ao criar link"),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
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
  )
}


