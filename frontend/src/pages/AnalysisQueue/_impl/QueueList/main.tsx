import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lock, Clock, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/table';
import { Badge } from '@/core/components/badge';
import { Button } from '@/core/components/button';
import { Skeleton } from '@/core/components/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/core/components/pagination';
import { Empty, EmptyDescription, EmptyTitle, EmptyMedia } from '@/core/components/empty';
import { formatDate } from '@/core/utils/date';
import type { AnalysisProposal } from '@/domain/analysis/types';
import { cn } from '@/core/lib/utils';

interface QueueListProps {
  proposals: AnalysisProposal[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onLockProposal: (id: number) => void;
  isLocking: boolean;
}

const slaColors: Record<string, string> = {
  Green: 'bg-green-500 text-white hover:bg-green-600',
  Yellow: 'bg-yellow-500 text-white hover:bg-yellow-600',
  Orange: 'bg-orange-500 text-white hover:bg-orange-600',
  Red: 'bg-red-500 text-white hover:bg-red-600',
  Black: 'bg-black text-white hover:bg-gray-900',
};

const slaLabels: Record<string, string> = {
  Green: 'No Prazo',
  Yellow: 'Atenção',
  Orange: 'Crítico',
  Red: 'Atrasado',
  Black: 'Expirado',
};

function QueueList({
  proposals,
  isLoading,
  pagination,
  onPageChange,
  onLockProposal,
  isLocking,
}: QueueListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <AlertCircle className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>Fila vazia</EmptyTitle>
        <EmptyDescription>Não há propostas pendentes de análise no momento.</EmptyDescription>
      </Empty>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SLA</TableHead>
              <TableHead>Proposta</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data Solicitação</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Espera</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal.idCreditRequest}>
                <TableCell>
                  <Badge
                    className={cn(
                      'w-24 justify-center font-semibold shadow-sm',
                      slaColors[proposal.slaIndicator] || 'bg-gray-500'
                    )}
                  >
                    {slaLabels[proposal.slaIndicator] || proposal.slaIndicator}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{proposal.proposalNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{proposal.clientName}</span>
                    <span className="text-muted-foreground text-xs">{proposal.clientCpf}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(proposal.requestDate)}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(proposal.requestedAmount)}
                </TableCell>
                <TableCell>{proposal.desiredTerm} meses</TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(proposal.requestDate), {
                      locale: ptBR,
                      addSuffix: false,
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onLockProposal(proposal.idCreditRequest)}
                    disabled={isLocking}
                  >
                    <Lock className="mr-2 h-3 w-3" />
                    Analisar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                className={pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  isActive={pagination.page === i + 1}
                  onClick={() => onPageChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}
                className={pagination.page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export { QueueList };
