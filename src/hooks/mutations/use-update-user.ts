import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/actions/update-user'
import { userQueryKey } from '@/hooks/queries/use-user'

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidar a query do usuário para atualizar os dados
      queryClient.invalidateQueries({ queryKey: userQueryKey() })
    },
  })
}

export const updateUserMutationKey = () => ['update-user'] as const
