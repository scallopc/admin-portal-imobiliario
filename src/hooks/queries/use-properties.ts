import { useQuery, queryOptions } from "@tanstack/react-query";
import type { PropertyListItem } from "@/actions/list-properties/schema";

export const propertiesQueryKey = () => ["properties", "list"] as const;

async function fetchProperties(): Promise<PropertyListItem[]> {
  const res = await fetch("/api/properties", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch properties");
  const data = await res.json();
  return data;
}

export function useProperties() {
  return useQuery(
    queryOptions({
      queryKey: propertiesQueryKey(),
      queryFn: fetchProperties,
      staleTime: 30_000,
    })
  );
}
