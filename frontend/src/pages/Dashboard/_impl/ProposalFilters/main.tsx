import { Input } from '@/core/components/input';
import { Button } from '@/core/components/button';
import { DatePicker } from '@/core/components/date-picker';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import type { CreditRequestListParams } from '@/domain/creditRequest/types';

interface ProposalFiltersProps {
  filters: CreditRequestListParams;
  onFilterChange: (filters: CreditRequestListParams) => void;
}

function ProposalFilters({ filters, onFilterChange }: ProposalFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const handleApplyFilters = () => {
    onFilterChange({
      ...filters,
      searchTerm,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      page: 1, // Reset to first page on filter change
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <span className="text-sm font-medium">Buscar por número</span>
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
          <Input
            placeholder="Ex: PROP-2023-00001"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <span className="text-sm font-medium">Data Inicial</span>
        <DatePicker date={startDate} onDateChange={setStartDate} className="w-full" />
      </div>

      <div className="flex-1 space-y-2">
        <span className="text-sm font-medium">Data Final</span>
        <DatePicker date={endDate} onDateChange={setEndDate} className="w-full" />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
        <Button variant="outline" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
}

export { ProposalFilters };
