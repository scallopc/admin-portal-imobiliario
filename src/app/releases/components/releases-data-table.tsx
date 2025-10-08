'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenSquare, Trash } from 'lucide-react'
import { useReleases } from '@/hooks/queries/use-releases'
import { useDeleteRelease } from '@/hooks/mutations/use-delete-release'
import { formatCurrency } from '@/lib/utils'
import { type Release } from '@/schemas/release'
import { DeleteDialog } from '@/components/common/delete-dialog'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Lançamento':
      return 'bg-blue-100 text-blue-800'
    case 'Em construção':
      return 'bg-yellow-100 text-yellow-800'
    case 'Pronto para entrega':
      return 'bg-green-100 text-green-800'
    case 'Entregue':
      return 'bg-gray-100 text-gray-800'
    case 'Pausado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ReleasesDataTable() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)

  const { data: releases = [], isLoading } = useReleases()

  const { mutate: deleteRelease, isPending: isDeleting } = useDeleteRelease()

  const handleEdit = React.useCallback((id: string) => {
    if (!id) return
    router.push(`/releases/${id}`)
  }, [router])

  const columns = [
    {
      key: 'title',
      header: 'Lançamento',
      cell: (row: Release) => (
        <div>
          <div className="text-sm font-medium">{row.title}</div>
          {row.code && (
            <div className="text-sm text-muted-foreground">
              Código: {row.code}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'developer',
      header: 'Construtora',
      cell: (row: Release) => (
        <div className="text-sm">{row.developer ? row.developer : 'Não informado'}</div>
      ),
      sortable: true,
    },
    {
      key: 'location',
      header: 'Localização',
      cell: (row: Release) => (
        <div className="flex items-center gap-1 text-sm">
          {row.address?.neighborhood} -  {row.address?.city}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Release) => {
        const status = row.status || ((row as any)?.isActive ? 'Ativo' : 'Inativo')
        return (
          <Badge className={getStatusColor(status || '')}>
            {status || '—'}
          </Badge>
        )
      },
      sortable: true,
    },
    {
      key: 'price',
      header: 'Preço',
      cell: (row: Release) => {
        const prices = (row.units || [])
          .map(u => u.price)
          .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
        
        if (prices.length === 0) {
          return <div className="text-sm text-muted-foreground">—</div>
        }
        
        const minPrice = Math.min(...prices)
        return (
          <div className="text-sm">
            <span className="text-muted-foreground mr-1">A partir de</span>
            <span className="font-medium">{formatCurrency(minPrice)}</span>
          </div>
        )
      },
      sortable: true,
    },
    {
      key: 'units',
      header: 'Unidades',
      cell: (row: Release) => {
        const unitsCount = row.units?.length || 0
        if (unitsCount > 0) {
          return (
            <div className="text-sm">
              {unitsCount} unidades
            </div>
          )
        }
        return <div className="text-sm text-muted-foreground">—</div>
      },
    },
    {
      key: 'delivery',
      header: 'Entrega',
      cell: (row: Release) => {
        const delivery = (row as any)?.delivery
        if (!delivery) {
          return <div className="text-sm text-muted-foreground">—</div>
        }
        
        try {
          const date = new Date(delivery)
          const monthNames = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
          ]
          
          return (
            <div className="text-sm">
              <div className="font-medium">
                {monthNames[date.getMonth()]}/{date.getFullYear()}
              </div>
            </div>
          )
        } catch {
          return <div className="text-sm text-muted-foreground">—</div>
        }
      },
      sortable: true,
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      cell: (row: Release) => {
        const createdAt = (row as any)?.createdAt as number | Date | undefined
        if (!createdAt) return <div className="text-sm text-muted-foreground">—</div>
        const d = typeof createdAt === 'number' ? new Date(createdAt) : createdAt
        return <div className="text-sm">{d.toLocaleDateString('pt-BR')}</div>
      },
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      cell: (row: Release) => (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => row.id && handleEdit(row.id)}
            disabled={!row.id}
          >
            <PenSquare className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row)}
            disabled={!row.id}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const handleDeleteClick = (release: Release) => {
    setSelectedRelease(release)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedRelease?.id) {
      deleteRelease(selectedRelease.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setSelectedRelease(null)
        }
      })
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={releases}
        isLoading={isLoading}
        emptyMessage="Nenhum lançamento encontrado"
        showPagination={true}
        defaultPageSize={10}
        enableSorting={true}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Lançamento"
        description={`Tem certeza que deseja excluir o lançamento "${selectedRelease?.title}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />

    </>
  )
}

