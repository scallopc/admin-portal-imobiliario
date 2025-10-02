"use client"

import Title from "@/components/common/title"
import LinksTable from "./links-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { ExportButton } from "@/components/common/export-button"
import { useLinks } from "@/hooks/queries/use-links"
import { useExportLinks } from "@/hooks/queries/use-export-links"

export default function LinksClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: links = [], isLoading } = useLinks()
  const { exportLinks } = useExportLinks()

  const handleExport = () => {
    exportLinks(links)
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Links" subtitle="Gerencie seus links" />
        <div className="flex gap-2">
          <ExportButton 
            onExport={handleExport}
            isLoading={isLoading}
            disabled={links.length === 0}
          />
          <Button onClick={() => startTransition(() => router.push("/links/new-link"))} disabled={isPending}> 
            <Plus className="mr-2 h-4 w-4" />
            {isPending ? "Abrindo..." : "Novo Link"}
          </Button>
        </div>
      </div>

      <LinksTable />
    </div>
  )
}
