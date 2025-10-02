import { useMutation } from '@tanstack/react-query'

type GenerateSlugInput = {
  description: string
}

type GenerateSlugResponse = {
  slug: string
}

export const generateSlugQueryKey = () => ['generate-slug'] as const

export function useGenerateSlug() {
  return useMutation<GenerateSlugResponse, Error, GenerateSlugInput>({
    mutationKey: generateSlugQueryKey(),
    mutationFn: async ({ description }) => {
      const response = await fetch('/api/ai/generate-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar slug')
      }

      return response.json()
    },
  })
}
