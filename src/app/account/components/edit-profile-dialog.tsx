"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateUserSchema, type UpdateUserInput } from "@/schemas/user"
import { useUpdateUser } from "@/hooks/mutations/use-update-user"

type Props = {
  initialName: string
  initialEmail: string
}

export function EditProfileDialog({ initialName, initialEmail }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const updateUserMutation = useUpdateUser()
  
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: initialName, email: initialEmail },
  })

  async function handleSubmit(values: UpdateUserInput) {
    try {
      const result = await updateUserMutation.mutateAsync(values)
      
      if (result.emailChanged && !result.sessionStillValid) {
        // Se o email foi alterado e a sessão não é mais válida, redirecionar
        toast.success("Email alterado com sucesso! Você será redirecionado para fazer login novamente.", {
          duration: 5000,
          action: {
            label: "OK",
            onClick: () => {
              router.push("/authentication")
            }
          }
        })
        
        // Redirecionar automaticamente após 3 segundos
        setTimeout(() => {
          router.push("/authentication")
        }, 3000)
      } else {
        // Se apenas o nome foi alterado ou a sessão ainda é válida
        toast.success("Perfil atualizado com sucesso")
        setOpen(false)
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao atualizar perfil")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">Editar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Atualize suas informações básicas</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="seu.email@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setOpen(false)
                  form.reset()
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
