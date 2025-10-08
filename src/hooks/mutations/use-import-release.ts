import { useMutation, useQueryClient } from '@tanstack/react-query'
import { releasesQueryKey } from '@/hooks/queries/use-releases'

export type ImportReleaseInput = {
  release: {
    title?: string
    slug?: string
    description?: string
    developer?: string
    status?: string
    address?: {
      city?: string
      neighborhood?: string
    }
    images?: string[]
    floorPlans?: string[]
    seo?: string
    features?: string[]
    videoUrl?: string
    virtualTourUrl?: string
    delivery: string
  }
  units: Record<string, any>[]
}

export function getImportReleaseMutationKey() {
  return ['import-release'] as const
}

export function useImportRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: getImportReleaseMutationKey(),
    mutationFn: async (payload: ImportReleaseInput) => {
      const res = await fetch('/api/releases/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao importar lançamento')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesQueryKey() })
    }
  })
}
