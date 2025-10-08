"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { updatePropertySchema, type UpdatePropertyInput } from "./schema";
import { z } from "zod";
import { CloudinaryService } from "@/services/cloudinary.service";
import { propertySchema } from "@/schemas/property";

export async function updateProperty(params: { id: string }, input: UpdatePropertyInput): Promise<{ id: string }> {
  try {
    // Valida os parâmetros de entrada
    const paramsResult = z.object({ id: z.string() }).safeParse(params);
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

    // Validar máximo 6 imóveis em destaque (apenas se estiver marcando como destaque)
    if (updateData.highlight) {
      const highlightCount = await adminDb
        .collection("properties")
        .where("highlight", "==", true)
        .get();
      
      // Se já existem 6 imóveis em destaque e este não é um deles, bloquear
      if (highlightCount.size >= 6) {
        const currentProperty = await docRef.get();
        const isCurrentlyHighlighted = currentProperty.data()?.highlight;
        
        if (!isCurrentlyHighlighted) {
          throw new Error("Máximo de 6 imóveis em destaque permitido");
        }
      }
    }

    const docRef = adminDb.collection("properties").doc(id);

    // Extrai as URLs para deletar e o resto dos dados
    const { urlsToDelete, ...propertyData } = updateData;

    // 1. Atualiza o documento no Firebase com os dados do imóvel
    await docRef.update({
      ...propertyData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 2. Após o sucesso da atualização, deleta as imagens no Cloudinary
    if (urlsToDelete && urlsToDelete.length > 0) {
      await CloudinaryService.deleteFiles(urlsToDelete);
    }

    return { id };
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw new Error("Falha ao atualizar o imóvel");
  }
}
