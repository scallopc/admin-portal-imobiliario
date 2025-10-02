import { useQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { PropertyDTO } from "@/actions/get-property/schema";
import { propertySchema } from "@/actions/get-property/schema";

export const propertyQueryKey = (id: string) => ["properties", id] as const;

// Função auxiliar para normalizar os dados do imóvel
function normalizePropertyData(data: any): any {
  // Cria uma cópia dos dados para não modificar o original
  const normalizedData = { ...data };

  // Normaliza o status
  if (normalizedData.status) {
    const statusMap: Record<string, string> = {
      available: "Venda",
      sold: "Venda",
      rented: "Aluguel",
      Venda: "Venda",
      Aluguel: "Aluguel",
    };
    normalizedData.status = statusMap[normalizedData.status] || normalizedData.status;
  }

  // Normaliza o tipo - converte para o formato correto
  if (normalizedData.type) {
    const typeMap: Record<string, string> = {
      casa: "Casa",
      apartamento: "Apartamento",
      penthouse: "Penthouse",
      cobertura: "Cobertura",
      sobrado: "Sobrado",
      kitnet: "Kitnet",
      studio: "Studio",
      terreno: "Terreno",
      comercial: "Comercial",
      Casa: "Casa",
      Apartamento: "Apartamento",
      Penthouse: "Penthouse",
      Cobertura: "Cobertura",
      Sobrado: "Sobrado",
      Kitnet: "Kitnet",
      Studio: "Studio",
      Terreno: "Terreno",
      Comercial: "Comercial",
    };

    const lowerType = normalizedData.type.toLowerCase();
    normalizedData.type = typeMap[lowerType] || normalizedData.type;
  }

  // Garante que listedBy seja string ou undefined
  if (normalizedData.listedBy === null || normalizedData.listedBy === "") {
    normalizedData.listedBy = undefined;
  }

  return normalizedData;
}

// Função auxiliar para validar e normalizar os dados do imóvel
function validateAndNormalizePropertyData(data: unknown): PropertyDTO {
  try {
    // Primeiro normaliza os dados
    const normalized = normalizePropertyData(data);

    // Depois valida com o schema
    const validated = propertySchema.parse(normalized);

    // Retorna os dados validados
    return validated;
  } catch (error) {
    console.error("Erro ao validar dados do imóvel:", error);
    if (error instanceof z.ZodError) {
      console.error("Erros de validação:", error.errors);
    }
    throw new Error("Os dados do imóvel estão em um formato inválido");
  }
}

async function fetchProperty(id: string): Promise<PropertyDTO> {
  if (!id) {
    throw new Error("ID do imóvel não fornecido");
  }

  try {
    const res = await fetch(`/api/properties/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!res.ok) {
      let errorMessage = `Erro na resposta da API (${res.status})`;

      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("Detalhes do erro da API:", errorData);
      } catch (e) {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }

      console.error(`${errorMessage} (Status: ${res.status})`);

      if (res.status === 404) {
        throw new Error("Imóvel não encontrado. O ID pode estar incorreto ou o imóvel pode ter sido removido.");
      }

      if (res.status >= 500) {
        throw new Error("O servidor está enfrentando problemas. Tente novamente mais tarde.");
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();

    // Valida e normaliza os dados antes de retornar
    return validateAndNormalizePropertyData(data);
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);

    if (error instanceof Error) {
      // Melhora mensagens de erro comuns
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
      }

      // Se já for um erro tratado, apenas propague
      if (
        error.message.startsWith("Imóvel não encontrado") ||
        error.message.startsWith("O servidor está enfrentando problemas")
      ) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new Error("Erro ao processar a resposta do servidor. Tente novamente mais tarde.");
      }
    }

    throw new Error("Ocorreu um erro inesperado ao carregar os dados do imóvel.");
  }
}

export function useProperty(id: string) {
  return useQuery<PropertyDTO, Error>({
    queryKey: propertyQueryKey(id),
    queryFn: () => fetchProperty(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Não tenta novamente para erros 4xx ou erros de validação
      if (
        error.message.includes("não encontrado") ||
        error.message.includes("formato inválido") ||
        error.message.includes("não fornecido")
      ) {
        return false;
      }
      // Tenta no máximo 2 vezes para outros erros
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
