import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/card';
import { cn } from '@/core/lib/utils';
import type { CreditRequestStats, RequestStatus } from '@/domain/creditRequest/types';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats?: CreditRequestStats;
  selectedStatus?: RequestStatus[];
  onStatusClick: (status: RequestStatus | undefined) => void;
}

function StatsCards({ stats, selectedStatus, onStatusClick }: StatsCardsProps) {
  if (!stats) return null;

  const isSelected = (status?: RequestStatus) => {
    if (!status) return selectedStatus?.length === 0;
    return selectedStatus?.includes(status);
  };

  const cards = [
    {
      title: 'Total de Propostas',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      status: undefined,
    },
    {
      title: 'Em Análise',
      value: stats.byStatus['Em Análise'] || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      status: 'Em Análise' as RequestStatus,
    },
    {
      title: 'Aprovadas',
      value: (stats.byStatus['Aprovado'] || 0) + (stats.byStatus['Efetivada'] || 0),
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: 'Aprovado' as RequestStatus,
    },
    {
      title: 'Reprovadas',
      value: stats.byStatus['Reprovado'] || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      status: 'Reprovado' as RequestStatus,
    },
    {
      title: 'Pendentes',
      value: stats.byStatus['Aguardando Documentação'] || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      status: 'Aguardando Documentação' as RequestStatus,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            isSelected(card.status) ? 'ring-primary ring-2' : ''
          )}
          onClick={() => onStatusClick(card.status)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={cn('rounded-full p-2', card.bgColor)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { StatsCards };
