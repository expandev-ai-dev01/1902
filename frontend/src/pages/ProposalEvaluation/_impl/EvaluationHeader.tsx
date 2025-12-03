import { Badge } from '@/core/components/badge';
import { formatDate } from '@/core/utils/date';
import type { EvaluationDetail } from '@/domain/creditRequest/types';

interface EvaluationHeaderProps {
  proposal: EvaluationDetail;
}

function EvaluationHeader({ proposal }: EvaluationHeaderProps) {
  return (
    <div className="flex flex-1 items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Avaliação de Proposta</h1>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>{proposal.requestNumber}</span>
          <span>•</span>
          <span>{formatDate(proposal.requestDate)}</span>
        </div>
      </div>
      <Badge variant="outline" className="px-4 py-1 text-base">
        {proposal.status}
      </Badge>
    </div>
  );
}

export { EvaluationHeader };
