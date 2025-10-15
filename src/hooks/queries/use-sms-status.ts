import { useQuery } from "@tanstack/react-query";
import { getSmsStatus } from "@/actions/twilio-sms";

export const smsStatusQueryKey = (messageId: string) => ["sms", "status", messageId] as const;

export function useSmsStatus(messageId: string, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: smsStatusQueryKey(messageId),
    queryFn: async () => {
      const result = await getSmsStatus(messageId);
      if (!result.success) {
        throw new Error(result.error || "Erro ao consultar status do SMS");
      }
      return result.data!;
    },
    enabled: (options?.enabled ?? true) && !!messageId,
    refetchInterval: options?.refetchInterval ?? 30000, // Atualizar a cada 30 segundos
    staleTime: 10000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
