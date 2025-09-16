import * as XLSX from 'xlsx';

type ExportToExcelOptions<T> = {
  data: T[];
  filename: string;
  headerMap?: Record<keyof T, string>;
  sheetName?: string;
};

export function exportToExcel<T extends Record<string, any>>({
  data,
  filename,
  headerMap,
  sheetName = 'Dados',
}: ExportToExcelOptions<T>) {
  if (data.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  // Mapeia os dados para o formato esperado pelo XLSX
  const rows = data.map((item) => {
    const row: Record<string, any> = {};
    Object.entries(item).forEach(([key, value]) => {
      // Pula propriedades que começam com _ ou são funções
      if (key.startsWith('_') || typeof value === 'function') return;
      
      // Usa o mapeamento de cabeçalho se fornecido, senão usa a chave original
      const header = headerMap?.[key as keyof T] || key;
      
      // Formata valores especiais
      if (value instanceof Date) {
        row[header] = value.toLocaleDateString('pt-BR');
      } else if (value === null || value === undefined) {
        row[header] = '';
      } else {
        row[header] = value;
      }
    });
    return row;
  });

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Gera o arquivo e faz o download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function getExcelBuffer<T extends Record<string, any>>(data: T[], headerMap?: Record<keyof T, string>) {
  if (data.length === 0) {
    return null;
  }

  const rows = data.map((item) => {
    const row: Record<string, any> = {};
    Object.entries(item).forEach(([key, value]) => {
      if (key.startsWith('_') || typeof value === 'function') return;
      const header = headerMap?.[key as keyof T] || key;
      row[header] = value instanceof Date ? value.toLocaleDateString('pt-BR') : value;
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}
