import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim();
}

function createSlug(text: string): string {
  const normalized = normalizeText(text)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  // Se o texto é menor que 70 caracteres, retorna como está
  if (normalized.length <= 70) {
    return normalized;
  }
  
  // Corta no último hífen antes de 70 caracteres para não cortar palavras
  const truncated = normalized.substring(0, 70);
  const lastHyphen = truncated.lastIndexOf('-');
  
  return lastHyphen > 30 ? truncated.substring(0, lastHyphen) : truncated;
}

function cleanText(text: string, removeLineBreaks = false): string {
  let cleaned = text
    .replace(/\*\*/g, '') // Remove **
    .replace(/\*/g, '') // Remove *
    .replace(/\[.*?\]/g, '') // Remove [texto]
    .trim()
  
  if (removeLineBreaks) {
    cleaned = cleaned.replace(/\n/g, ' ').replace(/\s+/g, ' ')
  }
  
  return cleaned.trim()
}

function truncateTitle(text: string, maxLength = 80): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Corta no último espaço antes do limite para não cortar palavras
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated;
}

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback: gerar versões simples sem IA
      // Extrair palavras-chave da descrição para criar título
      const words = description.toLowerCase().split(/\s+/)
      const keywords = words.filter((word: string) => 
        word.length > 3 && 
        !['para', 'com', 'uma', 'dos', 'das', 'que', 'este', 'esta', 'onde', 'cada', 'mais', 'muito', 'todo', 'toda'].includes(word)
      ).slice(0, 4)
      
      const fallbackTitle = keywords.length > 0 
        ? `Empreendimento ${keywords.join(' ').charAt(0).toUpperCase() + keywords.join(' ').slice(1)}`
        : "Empreendimento Exclusivo"
      
      const fallbackSlug = createSlug(fallbackTitle);

      return NextResponse.json({
        improvedDescription: description,
        title: truncateTitle(fallbackTitle),
        slug: fallbackSlug,
        seo: description.substring(0, 160),
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // ETAPA 1: Melhorar apenas a descrição
    const descriptionPrompt = `
    Com base na seguinte descrição de um empreendimento imobiliário, crie uma descrição EXTENSA e DETALHADA (mínimo 1500 caracteres).

    REGRAS IMPORTANTES:
    - Use apenas caracteres UTF-8 válidos
    - Mantenha acentos e caracteres especiais do português
    - Seja extremamente detalhado e persuasivo
    - Inclua características técnicas completas
    - Descreva benefícios e diferenciais
    - Mencione localização e facilidades próximas
    -Destaque acabamentos e materiais
    - Inclua informações sobre lazer, segurança e comodidades
    - Use linguagem de vendas persuasiva
    - Organize em parágrafos bem estruturados

    Descrição original: "${description}"

    Retorne APENAS a descrição melhorada, sem prefixos ou formatação especial.
    `

    const descriptionResult = await model.generateContent(descriptionPrompt)
    const descriptionResponse = await descriptionResult.response
    const improvedDescription = descriptionResponse.text().trim()
      .replace(/\*\*/g, '') // Remove **
      .replace(/\*/g, '') // Remove *
      .replace(/\[.*?\]/g, '') // Remove [texto]
      .replace(/\n{3,}/g, '\n\n') // Limita quebras de linha
      .trim()

    console.log('Descrição melhorada:', improvedDescription.substring(0, 200) + '...') // Debug log

    // ETAPA 2: Gerar título, slug e SEO baseados na descrição melhorada
    const metadataPrompt = `
    Com base na seguinte descrição COMPLETA de um empreendimento imobiliário, gere:

    1. TÍTULO OTIMIZADO: Crie um título chamativo e atrativo (máximo 80 caracteres)
       - Deve capturar a essência do empreendimento
       - Seja criativo e persuasivo
       - Use palavras-chave importantes
       - Não corte palavras no meio

    2. SLUG PARA URL: Gere um slug amigável para URL (apenas letras minúsculas, números e hífens)
       - Baseado no título e características principais
       - Máximo 70 caracteres
       - SEO-friendly
       - Não corte palavras no meio

    3. SEO META DESCRIPTION: Crie uma meta description otimizada (máximo 160 caracteres)
       - Resumo persuasivo do empreendimento
       - Inclua palavras-chave importantes
       - Call-to-action sutil

    IMPORTANTE: Use a descrição COMPLETA abaixo para criar conteúdo rico e específico.

    Descrição completa do empreendimento:
    "${improvedDescription}"

    Retorne EXATAMENTE no formato:
    TÍTULO: [título aqui]
    SLUG: [slug aqui]
    SEO: [meta description aqui]
    `

    const metadataResult = await model.generateContent(metadataPrompt)
    const metadataResponse = await metadataResult.response
    const metadataText = metadataResponse.text().trim()
    
    console.log('Resposta metadata da IA:', metadataText) // Debug log
    
    // Inicializar com valores padrão
    let title = ''
    let slug = ''
    let seo = ''

    // Procurar por cada seção no texto
    const titleMatch = metadataText.match(/TÍTULO:\s*(.*?)(?=\nSLUG:|$)/i)
    const slugMatch = metadataText.match(/SLUG:\s*(.*?)(?=\nSEO:|$)/i)
    const seoMatch = metadataText.match(/SEO:\s*([\s\S]*?)$/i)
    
    if (titleMatch && titleMatch[1]) {
      title = truncateTitle(cleanText(titleMatch[1], true))
    }
    
    if (slugMatch && slugMatch[1]) {
      const rawSlug = cleanText(slugMatch[1], true)
      slug = createSlug(rawSlug)
    }
    
    if (seoMatch && seoMatch[1]) {
      seo = cleanText(seoMatch[1], true).substring(0, 160)
    }

    // Fallbacks se algum campo não foi extraído - gerar com IA se necessário
    if (!title) {
      try {
        const titlePrompt = `
        Com base na seguinte descrição de empreendimento, crie APENAS um título chamativo e atrativo (máximo 80 caracteres):
        
        "${improvedDescription.substring(0, 500)}"
        
        Retorne APENAS o título, sem prefixos ou formatação.
        `
        
        const titleResult = await model.generateContent(titlePrompt)
        const titleResponse = await titleResult.response
        title = truncateTitle(cleanText(titleResponse.text().trim(), true))
      } catch (error) {
        console.error('Erro ao gerar título fallback:', error)
        title = 'Empreendimento Exclusivo'
      }
    }
    
    if (!slug) {
      slug = createSlug(title)
    }
    
    if (!seo) {
      seo = improvedDescription.substring(0, 160)
    }

    console.log('Dados finais extraídos:', { 
      improvedDescription: improvedDescription.substring(0, 100) + '...', 
      title, 
      slug, 
      seo 
    }) // Debug log

    return NextResponse.json({
      improvedDescription,
      title,
      slug,
      seo,
    });
  } catch (error) {
    console.error("Erro ao melhorar texto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
