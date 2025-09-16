"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getPropertyParamsSchema, propertySchema, type PropertyDTO } from "./schema"

// Função para migrar valores antigos para novos
function migratePropertyData(data: any) {
  // Mapeamento de valores antigos para novos
  const typeMapping: Record<string, string> = {
    'house': 'Casa',
    'apartment': 'Apartamento',
    'land': 'Terreno',
    'commercial': 'Comercial',
    'casa': 'Casa',
    'apartamento': 'Apartamento',
    'terreno': 'Terreno',
    'comercial': 'Comercial',
    'penthouse': 'Penthouse',
    'cobertura': 'Cobertura',
    'sobrado': 'Sobrado',
    'kitnet': 'Kitnet',
    'studio': 'Studio'
  }

  const statusMapping: Record<string, string> = {
    'for_sale': 'Venda',
    'for_rent': 'Aluguel',
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'available': 'Venda',
    'sold': 'Venda',
    'rented': 'Aluguel'
  }

  return {
    ...data,
    type: typeMapping[data.type] || data.type || 'Casa',
    status: statusMapping[data.status] || data.status || 'Venda'
  }
}

export async function getProperty(params: { id: string }): Promise<PropertyDTO> {
  console.log('Validando parâmetros de entrada...')
  const parsed = getPropertyParamsSchema.safeParse(params)
  if (!parsed.success) {
    console.error('Parâmetros inválidos:', parsed.error)
    throw new Error("Parâmetros inválidos")
  }
  
  const { id } = parsed.data
  console.log(`Buscando documento do Firestore com ID: ${id}`)
  
  const snap = await adminDb.collection("properties").doc(id).get()
  if (!snap.exists) {
    console.error(`Documento não encontrado para o ID: ${id}`)
    throw new Error("Imóvel não encontrado")
  }
  
  console.log('Documento encontrado, processando dados...')
  const d = snap.data() as any
  const migratedData = migratePropertyData(d)
  
  console.log('Convertendo datas...')
  const createdAt = migratedData.createdAt?.toDate ? migratedData.createdAt.toDate().toISOString() : (migratedData.createdAt ?? "")
  const updatedAt = migratedData.updatedAt?.toDate ? migratedData.updatedAt.toDate().toISOString() : (migratedData.updatedAt ?? "")
  
  const dto = { 
    id: snap.id, 
    ...migratedData, 
    createdAt, 
    updatedAt 
  }
  
  console.log('Dados processados, validando com o schema...')
  const validated = propertySchema.safeParse(dto)
  
  if (!validated.success) {
    console.error('Erro de validação do schema:', validated.error)
    console.error('Dados que falharam na validação:', JSON.stringify(dto, null, 2))
    throw new Error(`Dados do imóvel inválidos: ${validated.error.message}`)
  }
  
  console.log('Validação concluída com sucesso')
  return validated.data
}
