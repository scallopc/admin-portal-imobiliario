"use client"

import Title from "@/components/common/title"
import LinksTable from "./links-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useLinks } from "@/hooks/queries/use-links"

export default function Links() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: links = [], isLoading } = useLinks()

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Links" subtitle="Gerencie seus links" />
        <div className="flex gap-2">
          <Button onClick={() => startTransition(() => router.push("/links/new-link"))} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Link
          </Button>
        </div>
      </div>

      <LinksTable />
    </div>
  )
}
