"use client"

import { Button } from "@/components/ui/button"
import { useMigrateData } from "@/hooks/mutations/use-migrate-data"
import { toast } from "sonner"
import { Database } from "lucide-react"

export function MigrateDataButton() {
  const { mutate: migrateData, isPending } = useMigrateData()

  const handleMigrate = () => {
    migrateData(undefined, {
      onSuccess: (data) => {
        toast.success(
          `Migração concluída! ${data.leadsMigrated} leads e ${data.propertiesMigrated} propriedades migradas.`
        )
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao migrar dados")
      },
    })
  }

  return (
    <Button
      onClick={handleMigrate}
      disabled={isPending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Database className="h-4 w-4" />
      {isPending ? "Migrando..." : "Migrar Dados"}
    </Button>
  )
}
