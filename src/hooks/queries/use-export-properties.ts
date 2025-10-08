import { useCallback } from 'react';
import { useExportData } from './use-export-data';
import { PropertyListItem } from '@/actions/list-properties/schema';

export function useExportProperties() {
  const defaultHeaders = {
    id: 'ID',
    title: 'Título',
    propertyType: 'Tipo',
    status: 'Status',
    updatedAt: 'Última Atualização',
  };

  const { exportData } = useExportData<PropertyListItem>(defaultHeaders);

  const exportProperties = useCallback((properties: PropertyListItem[]) => {
    exportData(
      properties,
      `imoveis-${new Date().toISOString().split('T')[0]}`,
      undefined,
      'Imóveis'
    );
  }, [exportData]);

  return { exportProperties };
}
