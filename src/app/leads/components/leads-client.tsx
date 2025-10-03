"use client"

import Title from "@/components/common/title"
import LeadsTable from "./leads-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ExportButton } from "@/components/common/export-button"
import { useLeads } from "@/hooks/queries/use-leads"
import { useExportLeads } from "@/hooks/queries/use-export-leads"

export default function LeadsClient() {
  const router = useRouter()

  const { data: leads = [], isLoading } = useLeads()
  const { exportLeads } = useExportLeads()

  const handleExport = () => {
    exportLeads(leads)
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Leads" subtitle="Gerencie seus leads" />
        <div className="flex gap-2">
          <Button onClick={() => router.push("/leads/new-lead")} className="bg-muted-foreground text-white hover:bg-muted-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <ExportButton
          onExport={handleExport}
          isLoading={isLoading}
          disabled={leads.length === 0}
        />
      </div>

      <LeadsTable />
    </div>
  )
}
