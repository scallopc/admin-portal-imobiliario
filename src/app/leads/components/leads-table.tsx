"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DeleteDialog } from "@/components/common/delete-dialog"
import { useDeleteLead } from "@/hooks/mutations/use-delete-lead"
import { LeadListItem } from "@/actions/list-leads/schema"
import { useLeads } from "@/hooks/queries/use-leads"
import { Eye, PenSquare, Trash, MessageSquare, Mail } from "lucide-react"
import { LeadView } from "./lead-view"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function LeadsTable() {
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
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadListItem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [leadToView, setLeadToView] = useState<LeadListItem | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [leadToEmail, setLeadToEmail] = useState<LeadListItem | null>(null)

  const { data, isLoading } = useLeads()
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead()

  const handleEdit = (lead: LeadListItem) => {
    router.push(`/leads/${lead.id}`)
  }

  const handleView = (lead: LeadListItem) => {
    setLeadToView(lead)
    setViewDialogOpen(true)
  }

  const handleWhatsApp = (lead: LeadListItem) => {
    if (!lead.phone) {
      toast.error("Este lead não possui um telefone cadastrado")
      return
    }

    // Remove formatação do telefone
    const cleanPhone = lead.phone.replace(/\D/g, '')

    // Adiciona código do Brasil se não tiver
    const phoneWithCode = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    // Cria link do WhatsApp
    const whatsappLink = `https://wa.me/${phoneWithCode}`

    // Abre em nova aba
    window.open(whatsappLink, '_blank')
  }

  const handleEmail = (lead: LeadListItem) => {
    setLeadToEmail(lead)
    setEmailDialogOpen(true)
  }

  const handleDeleteClick = (lead: LeadListItem) => {
    setSelectedLead(lead)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedLead?.id) {
      deleteLead(selectedLead.id)
      setDeleteDialogOpen(false)
    }
  }

  const rows = data || []

  return (
    <>
      <DataTable<LeadListItem>
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
                  title="Visualizar"
                >
                  <Eye className="h-5 w-5 text-blue-400" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleWhatsApp(row)}
                  title="Abrir WhatsApp"
                  disabled={!row.phone}
                >
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(row)}
                  title="Editar"
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(row)}
                  title="Excluir"
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
        data={rows as LeadListItem[]}
        isLoading={isLoading}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir lead"
        description="Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita."
      />

      <LeadView
        lead={leadToView}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

    </>
  )
}
