import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    console.log("Dados recebidos:", { description });

    if (!description) {
      return NextResponse.json({ message: "Descrição é obrigatória" }, { status: 400 });
    }

    const geminiApiKey = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const geminiModelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY não está configurada.");
      return NextResponse.json(
        { message: "A chave da API do Gemini não está configurada no servidor." },
        { status: 500 }
      );
    }

    // Integração real com Gemini
    const prompt = `Gere uma meta description para SEO, com no máximo 160 caracteres, para um imóvel. O texto é para o Google, não para o usuário.

**Descrição base:**
${description}

**Requisitos estritos:**
- **Público-alvo**: Exclusivamente para robôs de busca (Googlebot).
- **Tom**: Impessoal, descritivo e técnico.
- **Proibido**: Não use chamadas para ação (CTAs) como "confira", "visite", "não perca", "oportunidade".
- **Foco**: Densidade de palavras-chave relevantes (tipo de imóvel, localização, características principais).
- **Formato**: Frases curtas e diretas.
- **Tamanho**: Máximo de 160 caracteres.
- **Originalidade**: Crie um texto novo, não resuma ou copie a descrição.

**Exemplo de estilo desejado**: "Apartamento de 3 quartos (1 suíte) com 120m² na Barra da Tijuca, Rio de Janeiro. Varanda gourmet, 2 vagas de garagem, condomínio com piscina e academia."

**Retorne apenas o texto final, sem formatação.**`;

    const model = geminiApiKey.getGenerativeModel({ model: geminiModelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text().trim();

    // Limitar a 160 caracteres se necessário, mas sem cortar palavras
    let seo = generatedText;
    if (seo.length > 160) {
      const truncated = seo.substring(0, 160);
      const lastSpace = truncated.lastIndexOf(" ");
      seo = lastSpace > 120 ? truncated.substring(0, lastSpace) : truncated;
    }

    return NextResponse.json({ seo });
  } catch (error) {
    console.error("Erro ao gerar SEO:", error);
    // Em caso de erro, retornar uma mensagem genérica
    return NextResponse.json({ message: "Erro interno do servidor ao gerar SEO." }, { status: 500 });
  }
}
