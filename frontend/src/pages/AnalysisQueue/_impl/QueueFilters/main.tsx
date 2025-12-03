import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/core/components/input';
import { Button } from '@/core/components/button';
import { DatePicker } from '@/core/components/date-picker';
import { Card, CardContent } from '@/core/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/core/components/collapsible';
import type { AnalysisQueueListParams } from '@/domain/analysis/types';

interface QueueFiltersProps {
  filters: AnalysisQueueListParams;
  onFilterChange: (filters: AnalysisQueueListParams) => void;
}

function QueueFilters({ filters, onFilterChange }: QueueFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );
  const [minAmount, setMinAmount] = useState(filters.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount?.toString() || '');

  const handleApplyFilters = () => {
    onFilterChange({
      ...filters,
      searchTerm,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount('');
    setMaxAmount('');
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
          <Input
            placeholder="Buscar por CPF ou Número da Proposta"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters}>Buscar</Button>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Data Inicial</span>
                <DatePicker date={startDate} onDateChange={setStartDate} className="w-full" />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Data Final</span>
                <DatePicker date={endDate} onDateChange={setEndDate} className="w-full" />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Valor Mínimo</span>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Valor Máximo</span>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end lg:col-span-4">
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-destructive hover:text-destructive ml-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export { QueueFilters };
