"use server";

import { adminDb } from "@/lib/firebase-admin";
import { listPropertiesResponseSchema, type PropertyListItem } from "./schema";
import { propertyTypes, statusProperty } from "@/lib/constants";

export async function listProperties(): Promise<PropertyListItem[]> {
  try {
    const snapshot = await adminDb.collection("properties").orderBy("updatedAt", "desc").get();
    const data = snapshot.docs.map(doc => {
      try {
        const d = doc.data() as any;
        const migratedData = d;
        const updatedAt = migratedData.updatedAt?.toDate ? migratedData.updatedAt.toDate().toISOString() : (migratedData.updatedAt ?? "");
        return {
          id: doc.id,
          title: migratedData.title ?? "",
          propertyType: migratedData.propertyType,
          status: migratedData.status ?? undefined,
          highlight: migratedData.highlight ?? false,
          updatedAt,
        };
      } catch (error) {
        console.error(`Erro ao processar documento ${doc.id}:`, error);
        // Retornar dados padrão para documentos com erro
        return {
          id: doc.id,
          title: "",
          propertyType: undefined,
          status: undefined,
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
          title: item.title || "",
          propertyType: propertyTypes.includes(item.propertyType) ? item.propertyType : undefined,
          status: statusProperty.includes(item.status) ? item.status : undefined,
          highlight: item.highlight ?? false,
          updatedAt: item.updatedAt || "",
        };
        } catch (error) {
          console.error('Erro ao corrigir item:', item, error);
          return {
            id: item.id || "",
            title: "",
            propertyType: undefined,
            status: undefined,
            highlight: false,
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
