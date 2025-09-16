"use server";

import { adminDb } from "@/lib/firebase-admin";
import { listPropertiesResponseSchema, type PropertyListItem } from "./schema";

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
    'comercial': 'Comercial'
  }

  const statusMapping: Record<string, string> = {
    'for_sale': 'Venda',
    'for_rent': 'Aluguel',
    'venda': 'Venda',
    'aluguel': 'Aluguel'
  }

  return {
    ...data,
    type: typeMapping[data.type] || data.type || 'Casa',
    status: statusMapping[data.status] || data.status
  }
}

export async function listProperties(): Promise<PropertyListItem[]> {
  try {
    const snapshot = await adminDb.collection("properties").orderBy("updatedAt", "desc").get();
    const data = snapshot.docs.map(doc => {
      try {
        const d = doc.data() as any;
        const migratedData = migratePropertyData(d);
        const updatedAt = migratedData.updatedAt?.toDate ? migratedData.updatedAt.toDate().toISOString() : (migratedData.updatedAt ?? "");
        return {
          id: doc.id,
          code: migratedData.code ?? "",
          title: migratedData.title ?? "",
          type: migratedData.type,
          status: migratedData.status ?? undefined,
          bedrooms: migratedData.bedrooms ?? 0,
          bathrooms: migratedData.bathrooms ?? 0,
          suites: migratedData.suites ?? 0,
          updatedAt,
        };
      } catch (error) {
        console.error(`Erro ao processar documento ${doc.id}:`, error);
        // Retornar dados padrão para documentos com erro
        return {
          id: doc.id,
          code: "",
          title: "",
          type: "Casa" as const,
          status: undefined,
          bedrooms: 0,
          bathrooms: 0,
          suites: 0,
          updatedAt: "",
        };
      }
    });
    
    const parsed = listPropertiesResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Erro de validação das propriedades:', parsed.error);
      console.error('Dados que falharam na validação:', JSON.stringify(data, null, 2));
      
      // Tentar corrigir dados inválidos
      const correctedData = data.map(item => {
        try {
          return {
            id: item.id || "",
            code: item.code || "",
            title: item.title || "",
            type: ["Casa", "Apartamento", "Terreno", "Comercial"].includes(item.type) ? item.type : "Casa",
            status: ["Venda", "Aluguel"].includes(item.status) ? item.status : undefined,
            bedrooms: typeof item.bedrooms === 'number' ? item.bedrooms : 0,
            bathrooms: typeof item.bathrooms === 'number' ? item.bathrooms : 0,
            suites: typeof item.suites === 'number' ? item.suites : 0,
            updatedAt: item.updatedAt || "",
          };
        } catch (error) {
          console.error('Erro ao corrigir item:', item, error);
          return {
            id: item.id || "",
            code: "",
            title: "",
            type: "Casa" as const,
            status: undefined,
            bedrooms: 0,
            bathrooms: 0,
            suites: 0,
            updatedAt: "",
          };
        }
      });
      
      const correctedParsed = listPropertiesResponseSchema.safeParse(correctedData);
      if (!correctedParsed.success) {
        console.error('Erro mesmo após correção:', correctedParsed.error);
        throw new Error("Invalid property list response");
      }
      return correctedParsed.data;
    }
    return parsed.data;
  } catch (error) {
    console.error('Erro na função listProperties:', error);
    throw error;
  }
}
