import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSms } from "@/actions/send-sms";
import type { SendSmsInput } from "@/actions/send-sms/schema";
import { toast } from "sonner";

export const sendSmsMutationKey = () => ["sms", "send"] as const;

export function useSendSms() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: sendSmsMutationKey(),
    mutationFn: async (input: SendSmsInput) => {
      try {
        console.log('Executando envio de SMS:', input);
        const result = await sendSms(input);
        console.log('Resultado do envio:', result);
        return result;
      } catch (error) {
        console.error('Erro na mutation de SMS:', error);
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      console.log('SMS mutation success:', { result, variables });
      
      if (result.success) {
        toast.success("SMS enviado com sucesso!", {
          description: `Mensagem enviada para ${variables.to}`
        });
        
        // Invalidar queries relacionadas se necessário
        if (variables.leadId) {
          queryClient.invalidateQueries({ 
            queryKey: ["leads", variables.leadId] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ["follow-up"] 
          });
        }
      } else {
        console.error('Envio de SMS falhou:', result.error);
        toast.error(result.error || "Erro ao enviar SMS");
      }
    },
    onError: (error: Error) => {
      console.error('SMS mutation error:', error);
      toast.error(error.message || "Erro ao enviar SMS");
    },
  });
}
