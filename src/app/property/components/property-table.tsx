"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { PenSquare, Trash, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useProperties } from "@/hooks/queries/use-properties"
import { useDeleteProperty } from "@/hooks/mutations/use-delete-property"
import { DeleteDialog } from "@/components/common/delete-dialog"
import { PropertyListItem } from "@/actions/list-properties/schema"
import { PropertyView } from "./property-view"

export default function PropertyTable() {
  const columns = [
    {
      key: "title",
      header: "Título",
      cell: (row: PropertyListItem) => row.title || '—'
    },
    {
      key: "type",
      header: "Tipo",
      cell: (row: PropertyListItem) => row.type
    },
    {
      key: "status",
      header: "Status",
      cell: (row: PropertyListItem) => row.status || '—'
    },
    {
      key: "updatedAt",
      header: "Atualizado em",
      cell: (row: PropertyListItem) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('pt-BR') : '—'
    },
  ]

  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertyListItem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [propertyToView, setPropertyToView] = useState<string | null>(null)

  const { data, isLoading } = useProperties()
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty()

  const handleEdit = (property: PropertyListItem) => {
    router.push(`/property/${property.id}`)
  }

  const handleView = (property: PropertyListItem) => {
    setPropertyToView(property.id)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (property: PropertyListItem) => {
    setSelectedProperty(property)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedProperty?.id) {
      deleteProperty(selectedProperty.id)
      setDeleteDialogOpen(false)
    }
  }

  const rows = data || []

  return (
    <>
      <DataTable<PropertyListItem>
        columns={[
          ...columns,
          {
            key: "actions",
            header: "Ações",
            sortable: false,
            cell: (row: PropertyListItem) => (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleView(row)}
                >
                  <Eye className="h-5 w-5 text-blue-400" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(row)}
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(row)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
        data={rows}
        isLoading={isLoading}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir imóvel"
        description="Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita."
      />

      <PropertyView
        propertyId={propertyToView}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </>
  )
}
