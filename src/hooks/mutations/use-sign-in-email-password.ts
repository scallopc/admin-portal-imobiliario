import { useMutation, mutationOptions, useQueryClient } from '@tanstack/react-query'
import { signInEmailPassword } from '@/actions/sign-in-email-password'
import { userQueryKey } from '@/hooks/queries/use-user'

export const signInMutationKey = () => ['auth', 'sign-in'] as const

type Input = { email: string; password: string }

export function useSignInEmailPassword() {
  const queryClient = useQueryClient()
  
  return useMutation(
    mutationOptions({
      mutationKey: signInMutationKey(),
      mutationFn: (input: Input) => signInEmailPassword(input),
      onSuccess: () => {
        // Invalidar cache do usuário para buscar dados do novo usuário
        queryClient.invalidateQueries({ queryKey: userQueryKey() })
      },
    })
  )
}
