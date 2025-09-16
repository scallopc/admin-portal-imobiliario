import { useQuery, queryOptions } from "@tanstack/react-query"
import type { LeadListItem } from "@/actions/list-leads/schema"

export const leadsQueryKey = () => ["leads", "list"] as const

async function fetchLeads(): Promise<LeadListItem[]> {
  const res = await fetch("/api/leads", { cache: "no-store" })
  if (!res.ok) throw new Error("Falha ao carregar leads")
  const data = await res.json();
  return data;
}

export function useLeads() {
  return useQuery(
    queryOptions({
      queryKey: leadsQueryKey(),
      queryFn: fetchLeads,
      staleTime: 30_000,
    })
  )
}


