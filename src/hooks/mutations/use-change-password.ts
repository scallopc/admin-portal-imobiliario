import { useMutation } from '@tanstack/react-query'
import { changePassword } from '@/actions/change-password'

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  })
}

export const changePasswordMutationKey = () => ['change-password'] as const
