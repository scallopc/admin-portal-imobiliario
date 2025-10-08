interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text' | 'template'
  text?: {
    body: string
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: Array<{
      type: 'body'
      parameters: Array<{
        type: 'text'
        text: string
      }>
    }>
  }
}

interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}

class WhatsAppService {
  private baseUrl: string
  private accessToken: string
  private phoneNumberId: string

  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0'
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || ''
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    
    if (!this.accessToken) {
      console.warn('⚠️ WHATSAPP_ACCESS_TOKEN não configurado')
    }
    
    if (!this.phoneNumberId) {
      console.warn('⚠️ WHATSAPP_PHONE_NUMBER_ID não configurado')
    }
  }

  /**
   * Envia uma mensagem de texto simples
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse> {
    const payload: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: message
      }
    }

    return this.sendMessage(payload)
  }

  /**
   * Envia uma mensagem de template
   */
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode: string = 'pt_BR',
    parameters: string[] = []
  ): Promise<WhatsAppResponse> {
    const payload: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: parameters.length > 0 ? [{
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        }] : undefined
      }
    }

    return this.sendMessage(payload)
  }

  /**
   * Envia mensagem de follow-up personalizada para lead
   */
  async sendFollowUpMessage(lead: {
    name: string
    phone: string
    status: string
    source: string
  }): Promise<WhatsAppResponse> {
    const message = this.generateFollowUpMessage(lead)
    return this.sendTextMessage(lead.phone, message)
  }

  /**
   * Gera mensagem personalizada de follow-up
   */
  private generateFollowUpMessage(lead: {
    name: string
    status: string
    source: string
  }): string {
    const greeting = `Olá ${lead.name}! 👋`
    
    let message = `${greeting}\n\n`
    
    switch (lead.status) {
      case 'Novo':
        message += `Ficamos muito felizes com seu interesse em nossos imóveis! 🏠\n\n`
        message += `Gostaria de agendar uma conversa para apresentar as melhores opções que temos disponíveis? 📅\n\n`
        break
        
      case 'Contatado':
        message += `Como você está? Espero que esteja bem! 😊\n\n`
        message += `Gostaria de saber se ainda tem interesse em conhecer nossos imóveis. Temos algumas novidades que podem te interessar! 🆕\n\n`
        break
        
      case 'Qualificado':
        message += `Espero que esteja tudo bem! 😊\n\n`
        message += `Lembro que você demonstrou interesse em nossos imóveis. Gostaria de agendar uma visita ou tem alguma dúvida específica? 🏠\n\n`
        break
        
      default:
        message += `Espero que esteja tudo bem! 😊\n\n`
        message += `Gostaria de saber se ainda tem interesse em nossos imóveis. Temos algumas novidades que podem te interessar! 🆕\n\n`
    }
    
    message += `Estou aqui para ajudar com qualquer dúvida! 💬\n\n`
    message += `Atenciosamente,\n`
    message += `Equipe Imobiliária 🏢`
    
    return message
  }

  /**
   * Envia mensagem via API do WhatsApp
   */
  private async sendMessage(payload: WhatsAppMessage): Promise<WhatsAppResponse> {
    // Verificar se as credenciais estão configuradas
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('Credenciais do WhatsApp não configuradas. Verifique WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID')
    }

    // URL correta: https://graph.facebook.com/v18.0/{phone-number-id}/messages
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText }
        }
        
        // Tratar erros específicos do WhatsApp
        if (response.status === 400) {
          throw new Error(`Dados inválidos: ${JSON.stringify(errorData)}`)
        } else if (response.status === 401) {
          throw new Error(`Token inválido ou expirado: ${JSON.stringify(errorData)}`)
        } else if (response.status === 403) {
          throw new Error(`Permissões insuficientes: ${JSON.stringify(errorData)}`)
        } else {
          throw new Error(`Erro do WhatsApp API: ${response.status} - ${JSON.stringify(errorData)}`)
        }
      }

      return JSON.parse(responseText)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Erro de rede: ${error}`)
    }
  }

  /**
   * Valida se o número de telefone está no formato correto
   */
  static validatePhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se começar com 0, remove
    const phoneWithoutZero = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone
    
    // Se não começar com 55 (Brasil), adiciona
    const phoneWithCountryCode = phoneWithoutZero.startsWith('55') 
      ? phoneWithoutZero 
      : `55${phoneWithoutZero}`
    
    return phoneWithCountryCode
  }

  /**
   * Verifica se o número está na lista de números permitidos para teste
   */
  static isTestNumber(phone: string): boolean {
    const testNumbers = [
      '5511999999999', // Número de teste padrão
      '5511987654321', // Outro número de teste
      // Adicione números de teste aqui
    ]
    
    const formattedPhone = this.validatePhoneNumber(phone)
    return testNumbers.includes(formattedPhone)
  }

  /**
   * Retorna um número de teste válido
   */
  static getTestNumber(): string {
    return '5511999999999' // Número de teste padrão
  }
}

export const whatsappService = new WhatsAppService()
export { WhatsAppService }
export type { WhatsAppMessage, WhatsAppResponse }
