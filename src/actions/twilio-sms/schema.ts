import { z } from "zod";

export const sendSmsSchema = z.object({
  to: z.string()
    .min(10, "Número de telefone deve ter pelo menos 10 dígitos")
    .regex(/^\+?[1-9]\d{1,14}$/, "Formato de telefone inválido"),
  message: z.string()
    .min(1, "Mensagem não pode estar vazia")
    .max(1600, "Mensagem muito longa (máximo 1600 caracteres)"),
  leadId: z.string().optional(),
  templateId: z.string().optional()
});

export const smsTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do template é obrigatório"),
  content: z.string().min(1, "Conteúdo do template é obrigatório"),
  variables: z.array(z.string()).optional().default([]),
  category: z.enum(["follow_up", "welcome", "reminder", "custom"]).default("custom")
});

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type SmsTemplate = z.infer<typeof smsTemplateSchema>;

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
  status?: string;
}

export interface SmsStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
  dateCreated: string;
  dateSent?: string;
  dateUpdated: string;
}
