import { z } from "zod";

export const sendSmsSchema = z.object({
  to: z.string()
    .min(1, "Número de telefone é obrigatório")
    .regex(/^\+?[1-9]\d{1,14}$/, "Formato de telefone inválido. Use formato internacional: +5521999999999"),
  message: z.string()
    .min(1, "Mensagem é obrigatória")
    .max(1600, "Mensagem muito longa (máximo 1600 caracteres)"),
  leadId: z.string().optional()
});

export type SendSmsInput = z.infer<typeof sendSmsSchema>;

export type SmsResponse = {
  success: boolean;
  messageId?: string;
  status?: string;
  cost?: number;
  error?: string;
};

export type SmsStatus = {
  messageId: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  dateCreated?: string;
  dateSent?: string;
  dateUpdated?: string;
};
