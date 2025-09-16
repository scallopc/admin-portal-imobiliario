import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importProperties } from '@/actions/import-properties'
import { propertiesQueryKey } from '@/hooks/queries/use-properties'

export function useImportProperties() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importProperties,
    onSuccess: () => {
      // Invalidar a query de propriedades para atualizar a lista
      queryClient.invalidateQueries({ queryKey: propertiesQueryKey() })
    },
  })
}

export const importPropertiesMutationKey = () => ['import-properties'] as const
