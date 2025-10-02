// This file should only be used on the server side
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Ensure this code only runs on the server
const isServer = typeof window === "undefined";

// Configura o Cloudinary a partir das variáveis de ambiente
if (!process.env.CLOUDINARY_URL) {
  throw new Error("A variável de ambiente CLOUDINARY_URL não está configurada");
}

const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
const cloudName = cloudinaryUrl.hostname || "";
const [apiKey, apiSecret] = cloudinaryUrl.username ? [cloudinaryUrl.username, cloudinaryUrl.password] : ["", ""];

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  static async uploadFile(buffer: Buffer, filename: string, folderName?: string): Promise<string> {
    if (!isServer) {
      throw new Error("uploadFile can only be used on the server side");
    }

    return new Promise((resolve, reject) => {
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: folderName ? `properties/${folderName}` : "properties",
          filename_override: filename,
          use_filename: true,
          unique_filename: true,
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          format: "webp",
          quality: "auto",
          flags: "lossy",
          eager: [{ fetch_format: "webp", quality: "auto" }],
          eager_async: false,
        },
        (error, result) => {
          if (error) {
            console.error("Erro no upload para o Cloudinary:", error);
            return reject(new Error("Falha ao fazer upload do arquivo para o Cloudinary"));
          }
          if (!result?.secure_url) {
            return reject(new Error("URL segura não retornada pelo Cloudinary"));
          }
          const eagerUrl = (result as any).eager?.[0]?.secure_url as string | undefined;
          resolve(eagerUrl || result.secure_url);
        }
      );

      readable.pipe(uploadStream);
    });
  }

  static async deleteFile(publicId: string): Promise<void> {
    if (!isServer) {
      throw new Error("deleteFile can only be used on the server side");
    }
    try {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Erro ao deletar arquivo do Cloudinary:", error);
            return reject(new Error(`Falha ao deletar a imagem: ${error.message}`));
          }
          if (result?.result !== "ok") {
            console.error("Resultado inesperado ao deletar arquivo:", result);
            return reject(new Error(`Falha ao deletar a imagem: ${result?.result || "resultado desconhecido"}`));
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${publicId}:`, error);
      throw error instanceof Error ? error : new Error("Erro desconhecido ao deletar o arquivo");
    }
  }

  static extractPublicId(url: string): string | null {
    try {
      const regex = /\/upload\/(?:v\d+\/)?(.*?)(?:\.[^.]+)?$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Erro ao extrair public ID da URL:", url, error);
      return null;
    }
  }

  static async deleteFiles(urls: string[]): Promise<boolean> {
    if (!isServer) {
      console.warn("CloudinaryService.deleteFiles() should only be called on the server side");
      return false;
    }

    const publicIds = urls.map(url => CloudinaryService.extractPublicId(url)).filter((id): id is string => !!id);
    console.log("Extracted public IDs:", publicIds);

    if (publicIds.length === 0) {
      console.warn("No valid public IDs found to delete.");
      return true;
    }

    try {
      const results = await Promise.allSettled(
        publicIds.map(publicId => {
          return new Promise<void>((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
              if (error) {
                console.error(`Error deleting file ${publicId}:`, error);
                reject(error);
              } else if (result?.result !== "ok") {
                console.error(`Unexpected result when deleting ${publicId}:`, result);
                reject(new Error(`Failed to delete ${publicId}: ${result?.result || "unknown error"}`));
              } else {
                resolve();
              }
            });
          });
        })
      );

      const failedDeletions = results
        .map((result, index) => (result.status === "rejected" ? publicIds[index] : null))
        .filter((id): id is string => id !== null);

      if (failedDeletions.length > 0) {
        console.warn("Failed to delete some resources:", failedDeletions);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting files from Cloudinary:", error);
      return false;
    }
  }

  static async deleteFolder(propertyId: string): Promise<void> {
    if (!isServer) {
      throw new Error("deleteFolder can only be used on the server side");
    }
    try {
      const prefix = `properties/${propertyId}`;
      await (cloudinary as any).api.delete_resources_by_prefix(prefix);
      await (cloudinary as any).api.delete_folder(prefix);
    } catch (error) {
      console.error(`Erro ao deletar a pasta ${propertyId} do Cloudinary:`, error);
    }
  }
}
