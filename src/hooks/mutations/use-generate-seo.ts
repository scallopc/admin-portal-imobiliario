import { useMutation } from '@tanstack/react-query'

type GenerateSEOInput = {
  description: string
}

type GenerateSEOResponse = {
  seo: string
}

async function generateSEO(input: GenerateSEOInput): Promise<GenerateSEOResponse> {
  
  const response = await fetch('/api/ai/generate-seo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })


  if (!response.ok) {
    let errorMessage = 'Erro ao gerar SEO'
    try {
      const error = await response.json()
      errorMessage = error.message || error.details || errorMessage
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  const result = await response.json()
  return result
}

export function useGenerateSEO() {
  return useMutation({
    mutationFn: generateSEO,
  })
}

export const generateSEOMutationKey = () => ['generate-seo'] as const
