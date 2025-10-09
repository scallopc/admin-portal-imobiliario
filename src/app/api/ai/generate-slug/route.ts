import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback: gerar slug simples sem IA
      const fallbackSlug = description
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
      
      return NextResponse.json({ slug: fallbackSlug })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    Com base na seguinte descrição de um empreendimento imobiliário, gere um slug amigável para URL seguindo estas regras:
    
    - Use apenas letras minúsculas
    - Use hífens para separar palavras
    - Remova acentos e caracteres especiais
    - Seja conciso (máximo 50 caracteres)
    - Foque nas palavras-chave principais do empreendimento
    - Se houver nome do empreendimento, use-o como base
    
    Descrição: "${description}"
    
    Retorne apenas o slug, sem aspas ou formatação adicional.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const slug = response.text().trim()

    // Limpar e validar o slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    return NextResponse.json({ slug: cleanSlug })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
