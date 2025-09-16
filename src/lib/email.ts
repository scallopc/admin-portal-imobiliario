// Configuração para serviço de email
// Você pode usar qualquer um destes serviços:

// 1. RESEND (Recomendado - fácil de configurar)
// npm install resend
// https://resend.com

// 2. SENDGRID
// npm install @sendgrid/mail
// https://sendgrid.com

// 3. AWS SES
// npm install @aws-sdk/client-ses
// https://aws.amazon.com/ses/

// 4. NODEMAILER (para SMTP próprio)
// npm install nodemailer
// https://nodemailer.com

export const emailConfig = {
  // Configurações do seu provedor de email
  provider: process.env.EMAIL_PROVIDER || "resend", // "resend", "sendgrid", "ses", "smtp"
  
  // Configurações específicas do provedor
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || "noreply@seudominio.com",
    fromName: process.env.FROM_NAME || "CRM Imobiliário",
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || "noreply@seudominio.com",
    fromName: process.env.FROM_NAME || "CRM Imobiliário",
  },
  
  ses: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    fromEmail: process.env.FROM_EMAIL || "noreply@seudominio.com",
    fromName: process.env.FROM_NAME || "CRM Imobiliário",
  },
  
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    fromEmail: process.env.FROM_EMAIL || "noreply@seudominio.com",
    fromName: process.env.FROM_NAME || "CRM Imobiliário",
  },
  
  // Configurações gerais
  webhookUrl: process.env.WEBHOOK_URL || "https://seudominio.com/api/email/webhook",
  replyToEmail: process.env.REPLY_TO_EMAIL || "contato@seudominio.com",
}

// Exemplo de implementação com Resend
// export async function sendEmailWithResend(to: string, subject: string, body: string, fromName?: string) {
//   const { Resend } = await import("resend")
//   const resend = new Resend(emailConfig.resend.apiKey)
  
//   return resend.emails.send({
//     from: `${fromName || emailConfig.resend.fromName} <${emailConfig.resend.fromEmail}>`,
//     to: [to],
//     subject: subject,
//     html: body.replace(/\n/g, "<br>"),
//     replyTo: emailConfig.replyToEmail,
//   })
// }

// Exemplo de implementação com SendGrid
// export async function sendEmailWithSendGrid(to: string, subject: string, body: string, fromName?: string) {
//   const sgMail = await import("@sendgrid/mail")
//   sgMail.setApiKey(emailConfig.sendgrid.apiKey!)
  
//   const msg = {
//     to: to,
//     from: {
//       email: emailConfig.sendgrid.fromEmail!,
//       name: fromName || emailConfig.sendgrid.fromName!,
//     },
//     subject: subject,
//     html: body.replace(/\n/g, "<br>"),
//     replyTo: emailConfig.replyToEmail,
//   }
  
//   return sgMail.send(msg)
// }

// Função principal para enviar email
// export async function sendEmail(to: string, subject: string, body: string, fromName?: string) {
//   try {
//     switch (emailConfig.provider) {
//       case "resend":
//         return await sendEmailWithResend(to, subject, body, fromName)
      
//       case "sendgrid":
//         return await sendEmailWithSendGrid(to, subject, body, fromName)
      
//       // Adicione outros provedores conforme necessário
      
//       default:
//         throw new Error(`Provedor de email não suportado: ${emailConfig.provider}`)
//     }
//   } catch (error) {
//     console.error("Erro ao enviar email:", error)
//     throw error
//   }
// }

