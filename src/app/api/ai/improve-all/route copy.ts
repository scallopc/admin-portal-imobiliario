import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback: gerar versões simples sem IA
      const fallbackSlug = description
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
      
      const fallbackTitle = description.split('\n')[0]?.substring(0, 60) || 'Empreendimento'
      
      return NextResponse.json({ 
        improvedDescription: description,
        title: fallbackTitle,
        slug: fallbackSlug,
        seo: description.substring(0, 160)
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    Com base na seguinte descrição de um empreendimento imobiliário, gere 4 versões otimizadas:

    1. DESCRIÇÃO MELHORADA: Crie uma descrição EXTENSA e DETALHADA (mínimo 1500 caracteres, sem limite máximo). 
    - Seja extremamente detalhado e persuasivo
    - Inclua características técnicas completas
    - Descreva benefícios e diferenciais
    - Mencione localização e facilidades próximas
    - Destaque acabamentos e materiais
    - Inclua informações sobre lazer, segurança e comodidades
    - Use linguagem de vendas persuasiva
    - Seja específico sobre áreas, quartos, vagas, etc.
    
    2. TÍTULO OTIMIZADO: Crie um título chamativo e atrativo (máximo 60 caracteres)
    3. SLUG PARA URL: Gere um slug amigável (apenas letras minúsculas, hífens, máximo 50 caracteres)
    4. SEO META DESCRIPTION: Crie uma meta description otimizada (máximo 160 caracteres)
    5. CONSTRUTORA: Nunca use o nome da construtora
    
    IMPORTANTE: Para a DESCRIÇÃO, seja MUITO detalhado e extenso. Não economize palavras. Inclua todos os detalhes possíveis sobre o empreendimento.

    Descrição original: "${description}"

    Retorne no formato exato:
    DESCRIÇÃO: descrição EXTENSA e detalhada com mínimo 1500 caracteres
    TÍTULO: título otimizado
    SLUG: slug para url
    SEO: meta description
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    console.log('IA Response:', text)

    // Extrair os valores do texto retornado
    const lines = text.split('\n').filter(line => line.trim())
    let improvedDescription = description
    let title = 'Empreendimento'
    let slug = ''
    let seo = ''

    // Procurar por cada seção no texto
    const descriptionMatch = text.match(/DESCRIÇÃO:\s*([\s\S]*?)(?=TÍTULO:|$)/)
    const titleMatch = text.match(/TÍTULO:\s*([\s\S]*?)(?=SLUG:|$)/)
    const slugMatch = text.match(/SLUG:\s*([\s\S]*?)(?=SEO:|$)/)
    const seoMatch = text.match(/SEO:\s*([\s\S]*?)$/)

    if (descriptionMatch) {
      improvedDescription = descriptionMatch[1].trim()
        .replace(/\*\*/g, '') // Remove **
        .replace(/\*/g, '') // Remove *
        .replace(/\[.*?\]/g, '') // Remove [texto]
        .replace(/\n\n/g, '\n') // Remove quebras duplas
        .trim()
      console.log('Description extracted:', improvedDescription.substring(0, 100) + '...')
    }
    if (titleMatch) {
      title = titleMatch[1].trim()
        .replace(/\*\*/g, '') // Remove **
        .replace(/\*/g, '') // Remove *
        .replace(/\[.*?\]/g, '') // Remove [texto]
        .replace(/\n/g, ' ') // Remove quebras de linha
        .trim()
      console.log('Title extracted:', title)
    }
    if (slugMatch) {
      slug = slugMatch[1].trim()
        .replace(/\*\*/g, '') // Remove **
        .replace(/\*/g, '') // Remove *
        .replace(/\[.*?\]/g, '') // Remove [texto]
        .trim()
      console.log('Slug extracted:', slug)
    }
    if (seoMatch) {
      seo = seoMatch[1].trim()
        .replace(/\*\*/g, '') // Remove **
        .replace(/\*/g, '') // Remove *
        .replace(/\[.*?\]/g, '') // Remove [texto]
        .replace(/\n/g, ' ') // Remove quebras de linha
        .trim()
      console.log('SEO extracted:', seo)
    }

    // Limpar e validar o slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return NextResponse.json({ 
      improvedDescription,
      title,
      slug: cleanSlug,
      seo
    })
  } catch (error) {
    console.error('Erro ao melhorar texto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
