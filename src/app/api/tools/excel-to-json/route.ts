import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type inválido' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Arquivo vazio ou ilegível' }, { status: 400 })
    }

    let xlsx: any
    try {
      // Import dinâmico para evitar falhas de build quando dependência não estiver instalada
      xlsx = (await import('xlsx')).default || (await import('xlsx'))
    } catch (e) {
      return NextResponse.json({ error: 'Dependência xlsx não encontrada. Instale com: npm install xlsx' }, { status: 500 })
    }

    const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    if (!sheet) {
      return NextResponse.json({ error: 'Planilha não encontrada no arquivo' }, { status: 422 })
    }

    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Sem dados na planilha' }, { status: 422 })
    }

    const norm = (s: string) => String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

    const known: Record<string, string[]> = {
      unidade: ['unidade', 'unid', 'apto', 'apartamento', 'un.'],
      vagas: ['vagas', 'vaga', 'garagem'],
      q: ['q', 'quartos', 'dormitorios', 'dorms', 'dorm', 'quarto'],
      'area privativa': ['area privativa', 'área privativa', 'area util', 'área util', 'metragem', 'm2', 'm²'],
      status: ['status', 'situacao', 'situação', 'disponibilidade'],
      ato: ['ato', 'ato x', 'entrada', 'sinal']
    }

    const maxScan = Math.min(rows.length, 15)
    let headerIndex = -1
    let bestScore = -1

    for (let i = 0; i < maxScan; i++) {
      const row = rows[i]
      if (!Array.isArray(row)) continue
      const headers = row.map((c) => String(c ?? '').trim())
      if (headers.every(h => !h)) continue
      const norms = headers.map(norm)
      let score = 0
      const flatKnown = Object.values(known).flat()
      for (const h of norms) {
        if (!h) continue
        if (flatKnown.some(k => h === k || h.includes(k) || k.includes(h))) score++
      }
      if (score > bestScore) {
        bestScore = score
        headerIndex = i
      }
    }

    if (headerIndex === -1 || bestScore <= 0) {
      return NextResponse.json({ error: 'Não foi possível identificar a linha de cabeçalho. Ajuste a planilha para que a primeira linha útil contenha nomes de colunas claros (ex.: Unidade, Vagas, Q, Área privativa, Status, Ato).' }, { status: 422 })
    }

    const rawHeader = rows[headerIndex].map((h) => String(h ?? '').trim()) as string[]
    const colIndices: number[] = []
    const finalHeaders: string[] = []
    rawHeader.forEach((h, idx) => {
      if (h) {
        finalHeaders.push(h)
        colIndices.push(idx)
      }
    })

    if (finalHeaders.length === 0) {
      return NextResponse.json({ error: 'Cabeçalhos vazios. Nomeie as colunas da planilha.' }, { status: 422 })
    }

    const preambleRows = rows.slice(0, headerIndex)
    const description = preambleRows
      .map(r => (Array.isArray(r) ? r.map(c => String(c ?? '').trim()).filter(Boolean).join(' | ') : ''))
      .filter(Boolean)
      .join('\n')

    const dataRows = rows.slice(headerIndex + 1)
    const data = dataRows
      .filter(r => Array.isArray(r) && r.some(cell => String(cell ?? '').trim() !== ''))
      .map((r) => {
        const obj: Record<string, any> = {}
        finalHeaders.forEach((key, i) => {
          const idx = colIndices[i]
          obj[key] = r[idx]
        })
        return obj
      })

    return NextResponse.json({ columns: finalHeaders, items: data, description })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao processar Excel' }, { status: 500 })
  }
}
