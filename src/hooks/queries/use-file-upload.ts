import { useState } from 'react'
import { parseFile } from '@/lib/excel-parser'
import { useImportProperties } from '../mutations/use-import-properties'
import { toast } from 'sonner'

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const importPropertiesMutation = useImportProperties()

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['.csv', '.xlsx', '.xls']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error('Formato de arquivo não suportado. Use CSV, XLSX ou XLS.')
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB')
      }

      // Processar arquivo
      const properties = await parseFile(file)
      
      if (properties.length === 0) {
        throw new Error('Nenhuma propriedade encontrada no arquivo')
      }

      // Importar propriedades
      const result = await importPropertiesMutation.mutateAsync({
        properties
      })

      if (result.success) {
        toast.success(result.message)
        
        // Mostrar detalhes dos erros se houver
        if (result.results.errors > 0) {
          const errorDetails = result.results.details
            .filter(d => !d.success)
            .map(d => `Linha ${d.index}: ${d.error}`)
            .join('\n')
          
          toast.error(`Alguns itens falharam:\n${errorDetails}`, {
            duration: 10000
          })
        }
      } else {
        throw new Error('Falha na importação')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido no upload')
    } finally {
      setIsUploading(false)
    }
  }

  return {
    handleFileUpload,
    isUploading: isUploading || importPropertiesMutation.isPending,
    error: importPropertiesMutation.error
  }
}
