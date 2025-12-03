import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/card';
import { Badge } from '@/core/components/badge';
import { formatDate } from '@/core/utils/date';
import type { CreditRequest, RequestStatus } from '@/domain/creditRequest/types';

interface HistoryListProps {
  history: CreditRequest[];
}

const statusColors: Record<RequestStatus, string> = {
  Rascunho: 'bg-gray-100 text-gray-800',
  'Aguardando Documentação': 'bg-yellow-100 text-yellow-800',
  'Em Análise': 'bg-blue-100 text-blue-800',
  Aprovado: 'bg-green-100 text-green-800',
  Reprovado: 'bg-red-100 text-red-800',
  Cancelado: 'bg-gray-800 text-white',
  Efetivada: 'bg-emerald-100 text-emerald-800',
};

function HistoryList({ history }: HistoryListProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhuma proposta anterior encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((item) => (
          <div
            key={item.idCreditRequest}
            className="flex flex-col gap-2 rounded-lg border p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.requestNumber}</span>
              <Badge className={statusColors[item.status]}>{item.status}</Badge>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>{formatDate(item.requestDate)}</span>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  item.creditAmount
                )}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { HistoryList };
