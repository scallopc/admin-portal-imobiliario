import { useCallback } from 'react';
import { exportToExcel } from '@/lib/export-utils';
import { toast } from 'sonner';

type HeaderMap<T> = Record<keyof T, string>;

export function useExportData<T extends Record<string, any>>(defaultHeaders: HeaderMap<T>) {
  const exportData = useCallback((
    data: T[], 
    filename: string, 
    customHeaders?: HeaderMap<T>,
    sheetName: string = 'Dados'
  ) => {
    try {
      if (data.length === 0) {
        toast.warning('Nenhum dado para exportar');
        return;
      }

      // Combina os cabeçalhos padrão com os personalizados (se houver)
      const headerMap = { ...defaultHeaders, ...(customHeaders || {}) } as Record<keyof T, string>;

      exportToExcel({
        data,
        filename,
        headerMap,
        sheetName,
      });

      toast.success('Exportação concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Ocorreu um erro ao exportar os dados. Tente novamente.');
    }
  }, [defaultHeaders]);

  return { exportData };
}
