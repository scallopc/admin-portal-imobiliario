"use server";

import { CloudinaryService } from "@/services/cloudinary.service";
import { deleteImageSchema, type DeleteImageInput } from "./schema";

export async function deleteImage(input: DeleteImageInput): Promise<{ success: boolean }> {
  try {
    const result = deleteImageSchema.safeParse(input);
    if (!result.success) {
      throw new Error("URL inválida");
    }

    const { url } = result.data;
    const publicId = CloudinaryService.extractPublicId(url);

    if (!publicId) {
      throw new Error("Não foi possível extrair o public_id da URL");
    }

    await CloudinaryService.deleteFile(publicId);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    throw new Error("Falha ao deletar a imagem");
  }
}
