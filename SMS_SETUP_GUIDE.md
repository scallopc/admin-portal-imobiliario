# 📱 Guia de Configuração de SMS - Portal Imobiliário

## 🎯 Status Atual

✅ **API SMS funcionando** - Status 200  
✅ **Validação de telefone** - Formatos brasileiros e internacionais  
✅ **Modo de desenvolvimento** - SMS simulados  
⚠️ **Envio real** - Requer configuração do DevSMS  

## 🔧 Por que não recebeu o SMS?

A API está funcionando em **modo de desenvolvimento** (simulado). Os SMS não são enviados realmente, apenas simulados para desenvolvimento e testes.

## 🚀 Como Ativar Envio Real de SMS

### 1. Criar Conta no DevSMS

1. Acesse o site do DevSMS
2. Crie uma conta
3. Verifique seu número de telefone

### 2. Obter Credenciais

1. **API Key**: Vá em "API" ou "Configurações"
2. **Client ID**: Mesmo local, copie o Client ID
3. **Sender ID**: Configure um identificador para envio

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# DevSMS Configuration
DEVSMS_API_KEY=your_api_key_here
DEVSMS_CLIENT_ID=your_client_id_here
DEVSMS_SENDER_ID=your_sender_id_here
```

### 4. Integração Já Implementada

A integração com DevSMS já está implementada na API! Apenas configure as variáveis de ambiente.

## 💰 Custos do DevSMS

- **SMS Brasil**: ~R$ 0,15 por mensagem
- **Solução brasileira**: Preços em reais
- **Suporte em português**: Atendimento nacional

## 🧪 Testando a Configuração

### Modo Desenvolvimento (Atual)
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to": "(11) 99999-9999", "message": "Teste", "leadId": "test"}'
```

**Response:**
```json
{
  "success": true,
  "messageId": "SMS_1761338920516_lx5x",
  "status": "sent",
  "cost": 0.0075,
  "mode": "development",
  "note": "Para envio real, configure as variáveis do Twilio"
}
```

### Modo Produção (Após Configuração)
**Response esperado:**
```json
{
  "success": true,
  "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "cost": 0.15,
  "mode": "production"
}
```

## 🔍 Verificando Logs

Os logs aparecem no console do servidor:

```bash
# Modo desenvolvimento
SMS enviado (DEV MODE): { messageId: 'SMS_...', to: '+5511999999999', ... }

# Modo produção
SMS enviado via Twilio: { messageId: 'SM...', status: 'queued', ... }
```

## 🛠️ Troubleshooting

### Erro 500
- Verifique se o servidor está rodando
- Verifique os logs do console
- Verifique se as variáveis de ambiente estão corretas

### SMS não enviado
- Verifique se está em modo de desenvolvimento
- Configure as variáveis do Twilio
- Verifique se o número de telefone está correto

### Formato de telefone
- ✅ `(11) 99999-9999` → `+5511999999999`
- ✅ `11999999999` → `+5511999999999`
- ✅ `+5511999999999` → aceito como está

## 📞 Próximos Passos

1. **Configurar Twilio** (se quiser envio real)
2. **Testar com números reais**
3. **Implementar webhooks** para status de entrega
4. **Adicionar templates** de mensagem
5. **Implementar agendamento** de SMS

---

**Status**: ✅ API funcionando em modo de desenvolvimento  
**Próximo**: Configure o Twilio para envio real de SMS
