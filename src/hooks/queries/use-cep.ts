import { useQuery } from "@tanstack/react-query"

export type CepAddress = {
  street: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export const getCepQueryKey = (cep: string) => ["cep", cep]

export function useCepQuery(cep: string, opts?: { enabled?: boolean }) {
  const enabled = Boolean(opts?.enabled ?? (cep && cep.length === 8))
  return useQuery<CepAddress, Error>({
    queryKey: getCepQueryKey(cep),
    queryFn: async () => {
      const res = await fetch(`/api/cep?cep=${cep}`)
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("CEP não encontrado")
        }
        throw new Error("Falha ao consultar CEP")
      }
      return res.json()
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.message === "CEP não encontrado") return false
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
  })
}
