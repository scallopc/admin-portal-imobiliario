// Função para processar arquivos CSV
export function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // Detectar separador (vírgula ou ponto e vírgula)
  const firstLine = lines[0]
  const separator = firstLine.includes(';') ? ';' : ','
  
  const headers = firstLine.split(separator).map(h => h.trim().toLowerCase())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim())
    if (values.length !== headers.length) continue

    const row: any = {}
    headers.forEach((header, index) => {
      let value: any = values[index]
      
      // Converter valores numéricos
      if (['preco', 'area', 'quartos', 'banheiros', 'suites', 'vagas', 'latitude', 'longitude'].includes(header)) {
        value = value ? parseFloat(value) : undefined
      }
      
      // Converter boolean
      if (header === 'mobiliado') {
        value = value === 'true' || value === '1' || value === 'sim' || value === 'yes'
      }
      
      // Converter arrays (separados por vírgula dentro da célula)
      if (['caracteristicas', 'imagens', 'videos', 'palavras-chave'].includes(header)) {
        value = value ? value.split(',').map((item: string) => item.trim()).filter(Boolean) : []
      }
      
      // Mapear nomes de campos
      const fieldMap: Record<string, string> = {
        'codigo': 'code',
        'titulo': 'title',
        'descricao': 'description',
        'tipo': 'type',
        'status': 'status',
        'preco': 'price',
        'moeda': 'currency',
        'area': 'area',
        'quartos': 'bedrooms',
        'banheiros': 'bathrooms',
        'suites': 'suites',
        'vagas': 'parkingSpaces',
        'mobiliado': 'furnished',
        'rua': 'address.street',
        'numero': 'address.number',
        'bairro': 'address.neighborhood',
        'cidade': 'address.city',
        'estado': 'address.state',
        'cep': 'address.zipCode',
        'pais': 'address.country',
        'latitude': 'coordinates.lat',
        'longitude': 'coordinates.lng',
        'caracteristicas': 'features',
        'imagens': 'images',
        'videos': 'videos',
        'palavras-chave': 'keywords',
        'entrega': 'delivery',
        'data_entrega': 'delivery',
        'entrega_data': 'delivery'
      }
      
      const fieldName = fieldMap[header] || header
      
      // Se for um campo aninhado (address, coordinates)
      if (fieldName.includes('.')) {
        const [parent, child] = fieldName.split('.')
        if (!row[parent]) row[parent] = {}
        row[parent][child] = value
      } else {
        row[fieldName] = value
      }
    })
    
    data.push(row)
  }

  return data
}

// Função para processar arquivos Excel (simplificada - requer biblioteca externa)
export async function parseExcel(file: File): Promise<any[]> {
  // Esta é uma implementação simplificada
  // Em produção, você usaria uma biblioteca como 'xlsx' ou 'exceljs'
  throw new Error('Processamento de Excel requer biblioteca externa. Use CSV por enquanto.')
}

// Função principal para processar arquivos
export async function parseFile(file: File): Promise<any[]> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (fileExtension === 'csv') {
    const content = await file.text()
    return parseCSV(content)
  } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
    return await parseExcel(file)
  } else {
    throw new Error('Formato de arquivo não suportado. Use CSV, XLSX ou XLS.')
  }
}
