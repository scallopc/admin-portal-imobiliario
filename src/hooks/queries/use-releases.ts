import { useQuery, queryOptions } from '@tanstack/react-query'
import { type Release } from '@/schemas/release'

export const releasesQueryKey = () => ["releases"] as const;
export const releaseQueryKey = (id: string) => ["release", id] as const;

export function useReleases() {
  return useQuery(
    queryOptions({
      queryKey: releasesQueryKey(),
      queryFn: async () => {
        const res = await fetch('/api/releases', { cache: 'no-store' })
        if (!res.ok) throw new Error('Falha ao carregar lançamentos')
        return (await res.json()) as Release[]
      },
      staleTime: 30_000,
    })
  );
}

export function useRelease(id: string) {
  return useQuery({
    queryKey: releaseQueryKey(id),
    queryFn: async () => {
      const res = await fetch(`/api/releases/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao carregar lançamento')
      return (await res.json()) as Release | null
    },
    enabled: !!id,
  })
}
