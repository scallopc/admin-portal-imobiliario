"use client"

import { DataTable } from "@/components/common/data-table"
import { LeadListItem } from "@/actions/list-leads/schema"
import { useLeads } from "@/hooks/queries/use-leads"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react"
import { LeadView } from "@/app/leads/components/lead-view"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default function DashboardTable() {
  const stageColors = {
    "Novo": "bg-blue-100 text-blue-800",
    "Contactado": "bg-yellow-100 text-yellow-800",
    "Qualificado": "bg-orange-100 text-orange-800",
    "Ganho": "bg-green-100 text-green-800",
    "Perdido": "bg-red-100 text-red-800"
  }

  const columns = [
    { key: "name", header: "Nome", cell: (row: LeadListItem) => row.name || "" },
    { 
      key: "status", 
      header: "Status", 
      cell: (row: LeadListItem) => (
        <Badge className={stageColors[row.status as keyof typeof stageColors]}>
          {row.status}
        </Badge>
      )
    },
    { 
      key: "source", 
      header: "Origem", 
      cell: (row: LeadListItem) => (
        <div>
          {row.source}
        </div>
      )
    },
    { key: "updatedAt", header: "Atualizado em", cell: (row: LeadListItem) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('pt-BR') : '—' },
  ]

  const { data, isLoading } = useLeads()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [leadToView, setLeadToView] = useState<LeadListItem | null>(null)
  const filteredRows = useMemo(() => {
    if (!data) return []
    return data.filter(lead => lead.status === "Novo")
  }, [data])

  
  const handleView = (lead: LeadListItem) => {
    setLeadToView(lead)
    setViewDialogOpen(true)
  }


  return (
    <>
      <DataTable
             columns={[
              ...columns,
              {
                key: "actions",
                header: "Ações",
                sortable: false,
                cell: (row: LeadListItem) => (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(row)}
                    >
                      <Eye className="h-5 w-5 text-blue-400" />
                    </Button>
                   
                  </div>
                ),
              },
            ]}
        data={filteredRows}
        isLoading={isLoading}
      />

<LeadView
      lead={leadToView}
      open={viewDialogOpen}
      onOpenChange={setViewDialogOpen}
    />
    </>
  )
}
