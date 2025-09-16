'use server'

import { adminDb } from '@/lib/firebase-admin'
import { importPropertiesSchema, type ImportPropertiesInput } from './schema'

export async function importProperties(data: ImportPropertiesInput) {
  try {
    const parsed = importPropertiesSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error(`Dados inválidos: ${parsed.error.errors.map(e => e.message).join(', ')}`)
    }

    const { properties } = parsed.data
    const results = {
      success: 0,
      errors: 0,
      details: [] as Array<{ index: number; success: boolean; error?: string; property: any }>
    }

    // Processar cada propriedade
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      
      try {
        // Normalizar dados
        const normalizedProperty = {
          ...property,
          // Garantir que arrays não sejam undefined
          features: property.features || [],
          images: property.images || [],
          videos: property.videos || [],
          keywords: property.keywords || [],
          // Garantir que campos opcionais tenham valores padrão
          furnished: property.furnished || false,
          currency: property.currency || 'BRL',
          address: property.address ? {
            ...property.address,
            country: property.address.country || 'Brasil'
          } : undefined,
          // Adicionar timestamps
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Salvar no Firestore
        await adminDb.collection('properties').add(normalizedProperty)
        
        results.success++
        results.details.push({
          index: i + 1,
          success: true,
          property: { title: property.title, code: property.code }
        })
      } catch (error) {
        results.errors++
        results.details.push({
          index: i + 1,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          property: { title: property.title, code: property.code }
        })
      }
    }

    return {
      success: true,
      message: `Importação concluída: ${results.success} propriedades importadas com sucesso, ${results.errors} erros`,
      results
    }
  } catch (error) {
    console.error('Erro ao importar propriedades:', error)
    throw new Error(`Falha ao importar propriedades: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}
