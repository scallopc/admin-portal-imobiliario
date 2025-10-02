'use client'

import React from 'react'
import { ReleasesDataTable } from './releases-data-table'
import { Button } from '@/components/ui/button'
import Title from '@/components/common/title'
import { toast } from 'sonner'
import { ExcelImportForm } from './excel-import-form'

export function ReleasesClient() {
  const excelInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isParsingExcel, setIsParsingExcel] = React.useState(false)
  const [excelData, setExcelData] = React.useState<{ columns: string[]; items: Record<string, any>[]; description?: string } | null>(null)


  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Lançamentos" subtitle="Gerencie seus lançamentos" />
        <div className="flex gap-2">
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,.csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setIsParsingExcel(true)
              try {
                const form = new FormData()
                form.append('file', file)
                const res = await fetch('/api/tools/excel-to-json', { method: 'POST', body: form })
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}))
                  throw new Error(data?.error || 'Falha ao processar Excel')
                }
                const data = await res.json()
                setExcelData({ columns: data.columns as string[], items: data.items as Record<string, any>[], description: data.description as string | undefined })
                toast.success('Planilha lida com sucesso')
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Erro ao processar Excel')
              } finally {
                setIsParsingExcel(false)
                if (excelInputRef.current) excelInputRef.current.value = ''
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => excelInputRef.current?.click()}
            disabled={isParsingExcel}
          >
            {isParsingExcel ? 'Lendo planilha...' : 'Adicionar empreendimento'}
          </Button>

        </div>
      </div>

      {excelData ? (
        <ExcelImportForm
          columns={excelData.columns}
          items={excelData.items}
          description={excelData.description}
          onCancel={() => setExcelData(null)}
          onSubmit={() => setExcelData(null)}
        />
      ) : (
        <ReleasesDataTable />
      )}
    </div>
  )
}
