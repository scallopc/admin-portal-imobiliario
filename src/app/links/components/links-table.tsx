"use client"

import { DataTable } from "@/components/common/data-table"
import { Button } from "@/components/ui/button"
import { useLinks } from "@/hooks/queries/use-links"
import { useDeleteLink } from "@/hooks/mutations/use-delete-link"
import { Trash, ExternalLink, PenSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteDialog } from "@/components/common/delete-dialog"
import { useState } from "react"

type LinkRow = {
  id: string
  type: string
  title: string
  url: string
  updatedAt?: string
}

export default function LinksTable() {
  const { data, isLoading } = useLinks()
  const { mutate: deleteLink, isPending: isDeleting } = useDeleteLink()
  const router = useRouter()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setSelectedLinkId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedLinkId) return
    deleteLink(selectedLinkId, {
      onSuccess: () => toast.success("Link excluído com sucesso"),
      onError: (e: any) => toast.error(e?.message || "Falha ao excluir link"),
      onSettled: () => setDeleteDialogOpen(false)
    })
  }

  const columns = [
    { key: "type", header: "Tipo", cell: (row: LinkRow) => row.type },
    { key: "title", header: "Título", cell: (row: LinkRow) => row.title },
    { key: "url", header: "URL", cell: (row: LinkRow) => (
      <a href={row.url} target="_blank" className="text-blue-500 inline-flex items-center gap-1">
        Abrir <ExternalLink className="h-3 w-3" />
      </a>
    ) },
    { key: "updatedAt", header: "Atualizado em", cell: (row: LinkRow) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('pt-BR') : '—' },
  ]

  return (
    <>

    <DataTable<LinkRow>
      columns={[
        ...columns,
        {
          key: "actions",
          header: "Ações",
          sortable: false,
          cell: (row: LinkRow) => (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/links/${row.id}`)}
                title="Editar"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(row.id)}
                disabled={isDeleting}
                title="Excluir"
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        },
      ]}
      data={(data || []) as LinkRow[]}
      isLoading={isLoading}
    />

    <DeleteDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleConfirmDelete}
      isLoading={isDeleting}
      title="Excluir link"
      description="Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita."
    />
        </>
  )
}


