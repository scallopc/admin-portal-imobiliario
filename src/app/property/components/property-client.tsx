"use client"

import Title from "@/components/common/title"
import PropertyTable from "./property-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PropertyClient() {
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Imóveis" subtitle="Gerencie seus imóveis" />
        <div className="flex gap-2">
          <Button onClick={() => handleNavigation("/property/new-property")}  className="bg-muted-foreground text-white hover:bg-muted-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Imóvel
          </Button>
        </div>
      </div>
      
      <PropertyTable />
    </div>
  )
}
