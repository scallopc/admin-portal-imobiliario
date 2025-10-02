"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getPropertyParamsSchema, propertySchema, type PropertyDTO } from "./schema"

// Função para migrar valores antigos para novos
function migratePropertyData(data: any) {
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
    'studio': 'Studio',
    'casa em condomínio': 'Casa em condomínio',
    'casa-condominio': 'Casa em condomínio',
  }

  const statusMapping: Record<string, string> = {
    'for_sale': 'Venda',
    'for_rent': 'Aluguel',
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'lançamento': 'Lançamento',
    'lancamento': 'Lançamento',
    'available': 'Venda',
    'sold': 'Venda',
    'rented': 'Aluguel',
  }

  const features = Array.isArray(data?.features)
    ? data.features
    : typeof data?.features === 'string'
      ? data.features.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

  const totalArea = data?.totalArea ?? data?.area_total ?? data?.area ?? undefined
  const privateArea = data?.privateArea ?? data?.area_privativa ?? undefined
  const usefulArea = data?.usefulArea ?? data?.area_util ?? undefined

  const videoUrl = data?.videoUrl ?? data?.video_url ?? ''
  const virtualTourUrl = data?.virtualTourUrl ?? data?.tour_virtual_url ?? ''
  const estimatedPrice = data?.estimatedPrice ?? data?.preco_aproximado ?? ''
  const suiteDetails = data?.suiteDetails ?? data?.detalhes_suite ?? ''
  const layout = data?.layout ?? data?.tipo_layout ?? undefined

  return {
    ...data,
    type: typeMapping[String(data?.type || '').toLowerCase()] || data?.type || 'Casa',
    status: statusMapping[String(data?.status || '').toLowerCase()] || data?.status || 'Venda',
    features,
    totalArea,
    privateArea,
    usefulArea,
    videoUrl,
    virtualTourUrl,
    estimatedPrice,
    suiteDetails,
    layout,
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
