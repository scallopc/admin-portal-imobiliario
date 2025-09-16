import { useCallback } from 'react';
import { exportToExcel } from '@/lib/export-utils';
import { LeadListItem } from '@/actions/list-leads/schema';
import { toast } from 'sonner';

export function useExportLeads() {
  const exportLeads = useCallback((leads: LeadListItem[]) => {
    try {
      // Mapeia os dados para garantir que todos os campos necessários estejam presentes
      const dataToExport = leads.map(lead => ({
        id: lead.id,
        code: lead.code || '',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        stage: lead.stage || '',
        source: lead.source || '',
        notes: lead.notes || '',
        createdAt: lead.createdAt || '',
        updatedAt: lead.updatedAt || ''
      }));

      const headerMap = {
        id: 'ID',
        code: 'Código',
        name: 'Nome',
        email: 'E-mail',
        phone: 'Telefone',
        stage: 'Etapa',
        source: 'Origem',
        notes: 'Observações',
        createdAt: 'Data de Criação',
        updatedAt: 'Última Atualização',
      };

      exportToExcel({
        data: dataToExport,
        filename: `leads-${new Date().toISOString().split('T')[0]}`,
        headerMap,
        sheetName: 'Leads',
      });

      toast.success('Exportação concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar leads:', error);
      toast.error('Ocorreu um erro ao exportar os leads. Tente novamente.');
    }
  }, []);

  return { exportLeads };
}
