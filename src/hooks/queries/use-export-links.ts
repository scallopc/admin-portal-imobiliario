import { useCallback } from 'react';
import { useExportData } from './use-export-data';
import { LinkListItem } from '@/actions/list-links/schema';

export function useExportLinks() {
  const defaultHeaders = {
    id: 'ID',
    type: 'Tipo',
    title: 'Título',
    url: 'URL',
    createdAt: 'Data de Criação',
    updatedAt: 'Última Atualização',
  };

  const { exportData } = useExportData<LinkListItem>(defaultHeaders);

  const exportLinks = useCallback((links: LinkListItem[]) => {
    exportData(
      links,
      `links-${new Date().toISOString().split('T')[0]}`,
      undefined,
      'Links'
    );
  }, [exportData]);

  return { exportLinks };
}
