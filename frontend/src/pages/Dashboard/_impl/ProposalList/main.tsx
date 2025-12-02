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
import { FileText, Upload } from 'lucide-react';
import { formatDate } from '@/core/utils/date';
import { useNavigation } from '@/core/hooks/useNavigation';
import type { CreditRequest, RequestStatus } from '@/domain/creditRequest/types';

interface ProposalListProps {
  proposals: CreditRequest[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

const statusColors: Record<RequestStatus, string> = {
  Rascunho: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  'Aguardando Documentação': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'Em Análise': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  Aprovado: 'bg-green-100 text-green-800 hover:bg-green-200',
  Reprovado: 'bg-red-100 text-red-800 hover:bg-red-200',
  Cancelado: 'bg-gray-800 text-white hover:bg-gray-900',
  Efetivada: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
};

function ProposalList({ proposals, isLoading, pagination, onPageChange }: ProposalListProps) {
  const { navigate } = useNavigation();

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
          <FileText className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>Nenhuma proposta encontrada</EmptyTitle>
        <EmptyDescription>
          Você ainda não possui solicitações de crédito ou nenhum resultado corresponde aos filtros.
        </EmptyDescription>
      </Empty>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow
                key={proposal.idCreditRequest}
                className="cursor-pointer"
                onClick={() => navigate(`/proposals/${proposal.idCreditRequest}`)}
              >
                <TableCell className="font-medium">{proposal.requestNumber}</TableCell>
                <TableCell>{formatDate(proposal.requestDate)}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(proposal.creditAmount)}
                </TableCell>
                <TableCell>{proposal.paymentTerm}</TableCell>
                <TableCell>
                  <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {proposal.status === 'Aguardando Documentação' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/documents/${proposal.idCreditRequest}`);
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}
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

export { ProposalList };
