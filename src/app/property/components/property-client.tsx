"use client"

import Title from "@/components/common/title"
import PropertyTable from "./property-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { MigrateDataButton } from "@/components/common/migrate-data-button"
import { ExportButton } from "@/components/common/export-button"
import { UploadButton } from "@/components/common/upload-button"
import { UploadInstructions } from "@/components/common/upload-instructions"
import { useProperties } from "@/hooks/queries/use-properties"
import { useExportProperties } from "@/hooks/use-export-properties"
import { useFileUpload } from "@/hooks/use-file-upload"

export default function PropertyClient() {
  const router = useRouter()
  const { data: properties = [], isLoading } = useProperties()
  const { exportProperties } = useExportProperties()
  const { handleFileUpload, isUploading } = useFileUpload()

  const handleExport = () => {
    exportProperties(properties)
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Imóveis" subtitle="Gerencie seus imóveis" />
        <div className="flex gap-2">
          <Button onClick={() => router.push("/property/new-property")} className="bg-muted-foreground text-white hover:bg-muted-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Imóvel
          </Button>
        </div>
      </div>
        <div className="flex gap-2 justify-end">
          <UploadButton 
            onUpload={handleFileUpload}
            isLoading={isUploading}
          />
          <ExportButton 
            onExport={handleExport}
            isLoading={isLoading}
            disabled={properties.length === 0}
          />
        </div>
      <PropertyTable />
    </div>
  )
}
