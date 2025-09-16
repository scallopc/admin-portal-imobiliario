"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { updatePropertyParamsSchema, updatePropertySchema, type UpdatePropertyInput } from "./schema";
import { propertySchema } from "@/schemas/property";

export async function updateProperty(params: { id: string }, input: UpdatePropertyInput): Promise<{ id: string }> {
  try {
    // Valida os parâmetros de entrada
    const paramsResult = updatePropertyParamsSchema.safeParse(params);
    if (!paramsResult.success) {
      throw new Error("Parâmetros inválidos");
    }

    // Valida os dados de entrada usando o schema de atualização
    const inputResult = updatePropertySchema.safeParse(input);
    if (!inputResult.success) {
      throw new Error("Dados de entrada inválidos");
    }

    const { id } = paramsResult.data;
    const updateData = inputResult.data;

    // Obtém o documento atual para mesclar os dados
    const docRef = adminDb.collection("properties").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error("Imóvel não encontrado");
    }

    // Mescla os dados atuais com os novos dados
    const currentData = doc.data() || {};
    const mergedData = { ...currentData, ...updateData, updatedAt: FieldValue.serverTimestamp() };

    // Atualiza o documento
    await docRef.set(mergedData, { merge: true });

    return { id };
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw new Error("Falha ao atualizar o imóvel");
  }
}
