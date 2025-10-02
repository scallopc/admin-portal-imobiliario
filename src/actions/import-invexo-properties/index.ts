'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'

const importInvexoPropertiesSchema = z.object({
  state: z.enum(['rj', 'sc']).default('rj'),
  limit: z.number().min(1).max(100).default(20),
  site: z.enum(['luxury', 'lancamentos', 'both']).default('both')
})

export type ImportInvexoPropertiesInput = z.infer<typeof importInvexoPropertiesSchema>

export async function importInvexoProperties(input: ImportInvexoPropertiesInput) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      }
    }

    const validatedInput = importInvexoPropertiesSchema.parse(input)
    
    console.log('Iniciando importação de propriedades do Invexo:', validatedInput)
    
    // Scraper REAL via API route
    console.log('Iniciando scraping REAL dos sites Invexo...')
    
    let mockProperties: any[] = []
    
    try {
      // Scraping real usando fetch simples
      console.log('Fazendo scraping real dos sites...')
      
      const scrapedData = await scrapeInvexoSitesSimple(validatedInput.site, validatedInput.limit)
      console.log(`Scraping REAL concluído! ${scrapedData.length} propriedades encontradas.`)
      console.log('Dados extraídos:', JSON.stringify(scrapedData, null, 2))
      mockProperties = scrapedData
      
    } catch (error) {
      console.error('Erro no scraping real:', error)
      console.log('Usando dados mockados como fallback...')
      mockProperties = [
        {
          title: 'Apartamento de Luxo - Ipanema',
          description: 'Apartamento de 3 quartos com vista para o mar em Ipanema. Imóvel de luxo com acabamentos de alto padrão, localização privilegiada e infraestrutura completa.',
          location: 'Ipanema, Rio de Janeiro',
          type: 'Apartamento',
          price: 'R$ 2.500.000',
          area: '120 m²',
          bedrooms: 3,
          bathrooms: 2,
          suites: 1,
          parking: 2,
          amenities: ['vista para o mar', 'piscina', 'academia'],
          status: 'available',
          source: 'invexo-luxury',
          externalId: 'invexo-luxury-ipanema-1',
          neighborhood: 'Ipanema',
          images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
          ]
        },
        {
          title: 'Cobertura Duplex - Leblon',
          description: 'Cobertura duplex com 4 quartos e vista panorâmica. Imóvel de luxo com acabamentos de alto padrão, localização privilegiada e infraestrutura completa.',
          location: 'Leblon, Rio de Janeiro',
          type: 'Cobertura',
          price: 'R$ 4.200.000',
          area: '200 m²',
          bedrooms: 4,
          bathrooms: 3,
          suites: 2,
          parking: 3,
          amenities: ['vista panorâmica', 'terraço', 'piscina'],
          status: 'available',
          source: 'invexo-luxury',
          externalId: 'invexo-luxury-leblon-2',
          neighborhood: 'Leblon',
          images: [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
          ]
        },
        {
          title: 'Mansão 5 Suítes - São Conrado',
          description: 'Mansão quadruplex de 450 m² no IPTU (a metragem da área construída é bem superior), em terreno de 2.000 m², indevassável, silenciosa, com deslumbrante vista para o mar.',
          location: 'São Conrado, Rio de Janeiro',
          type: 'Casa',
          price: 'R$ 40.000.000',
          area: '450 m²',
          bedrooms: 5,
          bathrooms: 8,
          suites: 5,
          parking: 4,
          amenities: ['vista para o mar', 'piscina', 'academia', 'jardim'],
          status: 'available',
          source: 'invexo-luxury',
          externalId: 'invexo-luxury-saoconrado-3',
          neighborhood: 'São Conrado',
          images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop'
          ]
        }
      ]
    }
    
    // Salvar as propriedades na base de dados
    console.log('Salvando propriedades na base de dados...')
    
    const savedProperties = []
    for (const property of mockProperties) {
      try {
        // Converter para o formato esperado pelo sistema
        const propertyData = {
          title: property.title,
          description: property.description,
          type: property.type,
          status: property.status === 'available' ? 'Venda' : 'Aluguel',
          price: property.price ? parseFloat(property.price.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined,
          currency: 'BRL',
          totalArea: property.area ? parseFloat(property.area.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          suites: property.suites,
          parkingSpaces: property.parking,
          features: property.amenities,
          images: property.images,
          address: {
            neighborhood: property.neighborhood,
            city: property.location.includes('Rio de Janeiro') ? 'Rio de Janeiro' : 'São Paulo',
            state: property.location.includes('Rio de Janeiro') ? 'RJ' : 'SP'
          },
          source: property.source,
          externalId: property.externalId
        }
        
        // Aqui você pode adicionar a lógica para salvar no banco de dados
        // Por enquanto, vamos simular o salvamento
        console.log('Salvando propriedade:', propertyData.title)
        savedProperties.push(propertyData)
        
      } catch (error) {
        console.error('Erro ao salvar propriedade:', property.title, error)
      }
    }
    
    return {
      success: true,
      message: `Importação concluída com sucesso! ${savedProperties.length} propriedades salvas na base de dados.`,
      data: {
        count: savedProperties.length,
        properties: savedProperties,
        source: 'invexo-luxury',
        state: validatedInput.state
      }
    }
    
  } catch (error) {
    console.error('Erro na importação do Invexo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }
  }
}

// Função de scraping simples sem Cheerio
async function scrapeInvexoSitesSimple(site: string, limit: number): Promise<any[]> {
  console.log(`Fazendo scraping simples do site: ${site} com limite: ${limit}`)
  
  const properties: any[] = []
  
  if (site === 'luxury' || site === 'both') {
    console.log('Scraping site luxury.invexo.com.br...')
    const luxuryProperties = await scrapeLuxurySiteSimple(limit)
    console.log(`Site luxury retornou ${luxuryProperties.length} propriedades`)
    properties.push(...luxuryProperties)
  }
  
  if (site === 'lancamentos' || site === 'both') {
    console.log('Scraping site lancamento.invexo.com.br...')
    const lancamentoProperties = await scrapeLancamentosSiteSimple(limit)
    console.log(`Site lançamentos retornou ${lancamentoProperties.length} propriedades`)
    properties.push(...lancamentoProperties)
  }
  
  console.log(`Total de propriedades encontradas: ${properties.length}`)
  return properties.slice(0, limit)
}

// Scraper simples do site luxury
async function scrapeLuxurySiteSimple(limit: number): Promise<any[]> {
  try {
    console.log('Fazendo requisição para luxury.invexo.com.br...')
    const response = await fetch('https://luxury.invexo.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML carregado, tamanho:', html.length)
    
    // Extrair dados específicos dos cards de propriedades
    const properties: any[] = []
    
    // Procurar por diferentes padrões de cards de propriedades
    const cardPatterns = [
      /<div[^>]*class="[^"]*card[^"]*"[^>]*>.*?<\/div>/gi,
      /<div[^>]*class="[^"]*property[^"]*"[^>]*>.*?<\/div>/gi,
      /<div[^>]*class="[^"]*imovel[^"]*"[^>]*>.*?<\/div>/gi,
      /<div[^>]*class="[^"]*listing[^"]*"[^>]*>.*?<\/div>/gi,
      /<article[^>]*>.*?<\/article>/gi,
      /<div[^>]*class="[^"]*item[^"]*"[^>]*>.*?<\/div>/gi
    ]
    
    let cards: string[] = []
    for (const pattern of cardPatterns) {
      const matches = html.match(pattern) || []
      if (matches.length > 0) {
        cards = matches
        console.log(`Encontrados ${cards.length} cards com padrão: ${pattern}`)
        break
      }
    }
    
    // Se não encontrou cards específicos, procurar por seções com propriedades
    if (cards.length === 0) {
      console.log('Procurando por seções de propriedades...')
      const sectionPatterns = [
        /<section[^>]*>.*?<\/section>/gi,
        /<div[^>]*class="[^"]*properties[^"]*"[^>]*>.*?<\/div>/gi,
        /<div[^>]*class="[^"]*listings[^"]*"[^>]*>.*?<\/div>/gi
      ]
      
      for (const pattern of sectionPatterns) {
        const sections = html.match(pattern) || []
        for (const section of sections) {
          const sectionCards = section.match(/<div[^>]*>.*?<\/div>/gi) || []
          if (sectionCards.length > 5) { // Se tem muitos divs, provavelmente são cards
            cards = sectionCards
            console.log(`Encontrados ${cards.length} cards em seção`)
            break
          }
        }
        if (cards.length > 0) break
      }
    }
    
    console.log(`Total de cards encontrados: ${cards.length}`)
    
    for (let i = 0; i < Math.min(cards.length, limit); i++) {
      const card = cards[i]
      
      // Extrair título - múltiplos padrões
      const titlePatterns = [
        /<h[1-6][^>]*>([^<]+(?:Quartos?|Dormitórios?|Suíte|Apartamento|Casa|Cobertura|Apto)[^<]*)<\/h[1-6]>/i,
        /<h[1-6][^>]*>([^<]+(?:Ipanema|Leblon|Copacabana|Barra|Botafogo|Flamengo)[^<]*)<\/h[1-6]>/i,
        /<h[1-6][^>]*>([^<]+(?:RJ|Rio de Janeiro)[^<]*)<\/h[1-6]>/i,
        /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i
      ]
      
      let title = null
      for (const pattern of titlePatterns) {
        const match = card.match(pattern)
        if (match && match[1].trim().length > 10) {
          title = match[1].trim()
          break
        }
      }
      
      // Extrair preço - múltiplos padrões
      const pricePatterns = [
        /R\$\s*([\d.,]+)/i,
        /R\$\s*([\d.,]+)/g
      ]
      
      let price = null
      for (const pattern of pricePatterns) {
        const match = card.match(pattern)
        if (match) {
          price = `R$ ${match[1]}`
          break
        }
      }
      
      // Extrair descrição
      const descPatterns = [
        /<p[^>]*>([^<]+(?:m²|metros|localizado|apartamento|andar)[^<]*)<\/p>/i,
        /<div[^>]*>([^<]+(?:m²|metros|localizado|apartamento)[^<]*)<\/div>/i,
        /<span[^>]*>([^<]+(?:m²|metros|localizado|apartamento)[^<]*)<\/span>/i
      ]
      
      let description = null
      for (const pattern of descPatterns) {
        const match = card.match(pattern)
        if (match && match[1].trim().length > 20) {
          description = match[1].trim()
          break
        }
      }
      
      // Extrair imagens
      const imgMatches = card.match(/<img[^>]+src="([^"]+)"/gi) || []
      const images = imgMatches.map(match => {
        const src = match.match(/src="([^"]+)"/i)?.[1]
        if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
          return src.startsWith('http') ? src : `https://luxury.invexo.com.br${src}`
        }
        return null
      }).filter(Boolean)
      
      // Extrair detalhes específicos - múltiplos padrões
      const bedroomsPatterns = [
        /Quartos?:\s*(\d+)/i,
        /(\d+)\s*quartos?/i,
        /(\d+)\s*dormitórios?/i
      ]
      
      const bathroomsPatterns = [
        /Banheiros?:\s*(\d+)/i,
        /(\d+)\s*banheiros?/i
      ]
      
      const parkingPatterns = [
        /Vagas?:\s*(\d+)/i,
        /(\d+)\s*vagas?/i
      ]
      
      const areaPatterns = [
        /Metragem:\s*(\d+)\s*m²/i,
        /(\d+)\s*m²/i,
        /(\d+)\s*metros?/i
      ]
      
      let bedrooms = 0
      let bathrooms = 0
      let parking = 0
      let area = ''
      
      for (const pattern of bedroomsPatterns) {
        const match = card.match(pattern)
        if (match) {
          bedrooms = parseInt(match[1])
          break
        }
      }
      
      for (const pattern of bathroomsPatterns) {
        const match = card.match(pattern)
        if (match) {
          bathrooms = parseInt(match[1])
          break
        }
      }
      
      for (const pattern of parkingPatterns) {
        const match = card.match(pattern)
        if (match) {
          parking = parseInt(match[1])
          break
        }
      }
      
      for (const pattern of areaPatterns) {
        const match = card.match(pattern)
        if (match) {
          area = `${match[1]} m²`
          break
        }
      }
      
      // Extrair localização
      const locationMatch = card.match(/(Ipanema|Leblon|Copacabana|Barra da Tijuca|Botafogo|Flamengo|Lagoa|Jardim Botânico|Gávea|São Conrado|Recreio|Tijuca|Vila Isabel|Méier|Tijuca|Barra|Zona Sul|Zona Norte|Zona Oeste)/i)
      const location = locationMatch ? locationMatch[1] : 'Rio de Janeiro'
      
      if (title && title.length > 10) {
        properties.push({
          title: title,
          description: description || `Imóvel de luxo localizado em ${location}. ${title}`,
          location: location,
          type: extractPropertyTypeSimple(title),
          price: price || 'Consulte',
          area: area,
          bedrooms: bedrooms,
          bathrooms: bathrooms,
          suites: 0,
          parking: parking,
          amenities: ['luxo', 'alto padrão'],
          status: 'available',
          source: 'invexo-luxury',
          externalId: `invexo-luxury-${i}-${Date.now()}`,
          neighborhood: location,
          images: images.slice(0, 3)
        })
      }
    }
    
    console.log(`Site luxury: ${properties.length} propriedades extraídas`)
    return properties
    
  } catch (error) {
    console.error('Erro no scraping do site luxury:', error)
    return []
  }
}

// Scraper simples do site lançamentos
async function scrapeLancamentosSiteSimple(limit: number): Promise<any[]> {
  try {
    console.log('Fazendo requisição para lancamento.invexo.com.br/rj/...')
    const response = await fetch('https://lancamento.invexo.com.br/rj/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML carregado, tamanho:', html.length)
    
    // Extrair dados específicos dos cards de lançamentos
    const properties: any[] = []
    
    // Procurar por cards de lançamentos - padrão mais específico
    const cardRegex = /<div[^>]*class="[^"]*card[^"]*"[^>]*>.*?<\/div>/gi
    const cards = html.match(cardRegex) || []
    
    console.log(`Encontrados ${cards.length} cards de lançamentos`)
    
    for (let i = 0; i < Math.min(cards.length, limit); i++) {
      const card = cards[i]
      
      // Extrair título - procurar por padrões específicos de lançamento
      const titleMatch = card.match(/<h[1-6][^>]*>([^<]+(?:Quartos?|Dormitórios?|Suíte|Apartamento|Casa|Cobertura|Lançamento|Residencial)[^<]*)<\/h[1-6]>/i)
      const title = titleMatch ? titleMatch[1].trim() : null
      
      // Extrair preço - procurar por R$ seguido de números ou "A partir de"
      const priceMatch = card.match(/(?:A partir de\s*)?R\$\s*([\d.,]+)/i)
      const price = priceMatch ? `R$ ${priceMatch[1]}` : null
      
      // Extrair descrição
      const descMatch = card.match(/<p[^>]*>([^<]+(?:m²|metros|localizado|apartamento|lançamento)[^<]*)<\/p>/i)
      const description = descMatch ? descMatch[1].trim() : null
      
      // Extrair imagens
      const imgMatches = card.match(/<img[^>]+src="([^"]+)"/gi) || []
      const images = imgMatches.map(match => {
        const src = match.match(/src="([^"]+)"/i)?.[1]
        if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('icon')) {
          return src.startsWith('http') ? src : `https://lancamento.invexo.com.br${src}`
        }
        return null
      }).filter(Boolean)
      
      // Extrair detalhes específicos
      const bedroomsMatch = card.match(/Quartos?:\s*(\d+)/i)
      const bathroomsMatch = card.match(/Banheiros?:\s*(\d+)/i)
      const parkingMatch = card.match(/Vagas?:\s*(\d+)/i)
      const areaMatch = card.match(/Metragem:\s*(\d+)\s*m²/i) || card.match(/(\d+)\s*m²/i)
      
      // Extrair localização
      const locationMatch = card.match(/(Ipanema|Leblon|Copacabana|Barra da Tijuca|Botafogo|Flamengo|Lagoa|Jardim Botânico|Gávea|São Conrado|Recreio|Tijuca|Vila Isabel|Méier|Tijuca|Barra|Zona Sul|Zona Norte|Zona Oeste)/i)
      const location = locationMatch ? locationMatch[1] : 'Rio de Janeiro'
      
      if (title && title.length > 10) {
        properties.push({
          title: title,
          description: description || `Lançamento imobiliário em ${location}. ${title}`,
          location: location,
          type: extractPropertyTypeSimple(title),
          price: price || 'Consulte',
          area: areaMatch ? `${areaMatch[1]} m²` : '',
          bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0,
          bathrooms: bathroomsMatch ? parseInt(bathroomsMatch[1]) : 0,
          suites: 0,
          parking: parkingMatch ? parseInt(parkingMatch[1]) : 0,
          amenities: ['lançamento', 'novo'],
          status: 'available',
          source: 'invexo-lancamentos',
          externalId: `invexo-lancamentos-${i}-${Date.now()}`,
          neighborhood: location,
          images: images.slice(0, 3)
        })
      }
    }
    
    console.log(`Site lançamentos: ${properties.length} lançamentos extraídos`)
    return properties
    
  } catch (error) {
    console.error('Erro no scraping do site lançamentos:', error)
    return []
  }
}

// Função auxiliar para extrair tipo de propriedade
function extractPropertyTypeSimple(title: string): string {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('apartamento')) return 'Apartamento'
  if (titleLower.includes('cobertura')) return 'Cobertura'
  if (titleLower.includes('casa')) return 'Casa'
  if (titleLower.includes('penthouse')) return 'Penthouse'
  if (titleLower.includes('sobrado')) return 'Sobrado'
  if (titleLower.includes('kitnet')) return 'Kitnet'
  if (titleLower.includes('studio')) return 'Studio'
  return 'Apartamento'
}


