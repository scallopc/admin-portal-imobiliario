import { useMutation } from '@tanstack/react-query'

type ImproveAllInput = {
  description: string
}

type ImproveAllResponse = {
  improvedDescription: string
  title: string
  slug: string
  seo: string
}

export const improveAllQueryKey = () => ['improve-all'] as const

export function useImproveAll() {
  return useMutation<ImproveAllResponse, Error, ImproveAllInput>({
    mutationKey: improveAllQueryKey(),
    mutationFn: async ({ description }) => {
      const response = await fetch('/api/ai/improve-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao melhorar texto')
      }

      return response.json()
    },
  })
}
