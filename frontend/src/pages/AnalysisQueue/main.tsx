import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalysisQueue, useLockProposal } from '@/domain/analysis';
import type { AnalysisQueueListParams } from '@/domain/analysis/types';
import { Button } from '@/core/components/button';
import { useNavigation } from '@/core/hooks/useNavigation';
import { QueueFilters } from './_impl/QueueFilters';
import { QueueList } from './_impl/QueueList';

function AnalysisQueuePage() {
  const { navigate } = useNavigation();
  const [filters, setFilters] = useState<AnalysisQueueListParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch, isRefetching } = useAnalysisQueue(filters);
  const { mutateAsync: lockProposal, isPending: isLocking } = useLockProposal();

  const handleFilterChange = (newFilters: AnalysisQueueListParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Fila atualizada');
  };

  const handleLockProposal = async (id: number) => {
    try {
      await lockProposal(id);
      toast.success('Proposta selecionada para análise');
      // Navigate to evaluation page (assuming route structure)
      navigate(`/analysis/evaluate/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao selecionar proposta';
      toast.error(errorMessage);
      // Refresh queue if lock failed (likely taken by someone else)
      refetch();
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fila de Análise</h1>
          <p className="text-muted-foreground">
            Gerencie e priorize as propostas de crédito pendentes.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-muted rounded-lg px-4 py-2 text-sm font-medium">
            Total na Fila: <span className="text-primary">{data?.total || 0}</span>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading || isRefetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <QueueFilters filters={filters} onFilterChange={handleFilterChange} />

      <QueueList
        proposals={data?.data || []}
        isLoading={isLoading}
        pagination={{
          page: data?.page || 1,
          pageSize: data?.pageSize || 10,
          total: data?.filteredTotal || 0,
        }}
        onPageChange={handlePageChange}
        onLockProposal={handleLockProposal}
        isLocking={isLocking}
      />
    </div>
  );
}

export { AnalysisQueuePage };
