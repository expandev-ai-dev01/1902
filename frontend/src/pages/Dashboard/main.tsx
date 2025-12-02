import { useState } from 'react';
import { useCreditRequestList, useCreditRequestStats } from '@/domain/creditRequest';
import type { CreditRequestListParams, RequestStatus } from '@/domain/creditRequest/types';
import { Button } from '@/core/components/button';
import { Plus } from 'lucide-react';
import { useNavigation } from '@/core/hooks/useNavigation';
import { StatsCards } from './_impl/StatsCards';
import { ProposalFilters } from './_impl/ProposalFilters';
import { ProposalList } from './_impl/ProposalList';

function DashboardPage() {
  const { navigate } = useNavigation();
  const [filters, setFilters] = useState<CreditRequestListParams>({
    page: 1,
    pageSize: 10,
  });

  const { data: proposalsData, isLoading: isLoadingProposals } = useCreditRequestList(filters);
  const { data: statsData } = useCreditRequestStats();

  const handleStatusClick = (status: RequestStatus | undefined) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      status: status ? [status] : undefined,
    }));
  };

  const handleFilterChange = (newFilters: CreditRequestListParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Acompanhamento</h1>
          <p className="text-muted-foreground">
            Gerencie suas solicitações de crédito e acompanhe o status em tempo real.
          </p>
        </div>
        <Button onClick={() => navigate('/credit-request')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      <StatsCards
        stats={statsData}
        selectedStatus={filters.status}
        onStatusClick={handleStatusClick}
      />

      <div className="space-y-4">
        <ProposalFilters filters={filters} onFilterChange={handleFilterChange} />
        <ProposalList
          proposals={proposalsData?.data || []}
          isLoading={isLoadingProposals}
          pagination={{
            page: proposalsData?.page || 1,
            pageSize: proposalsData?.pageSize || 10,
            total: proposalsData?.total || 0,
          }}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export { DashboardPage };
