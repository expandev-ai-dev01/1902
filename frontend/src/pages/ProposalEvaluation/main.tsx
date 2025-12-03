import { useParams } from 'react-router-dom';
import { useEvaluationDetail } from '@/domain/creditRequest';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { useNavigation } from '@/core/hooks/useNavigation';
import { Button } from '@/core/components/button';
import { ArrowLeft } from 'lucide-react';
import { EvaluationHeader } from './_impl/EvaluationHeader';
import { ClientInfo } from './_impl/ClientInfo';
import { ProposalInfo } from './_impl/ProposalInfo';
import { DocumentList } from './_impl/DocumentList';
import { HistoryList } from './_impl/HistoryList';
import { DecisionDialogs } from './_impl/DecisionDialogs';

function ProposalEvaluationPage() {
  const { id } = useParams<{ id: string }>();
  const { goBack } = useNavigation();
  const { data: proposal, isLoading, error } = useEvaluationDetail(Number(id));

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Erro ao carregar proposta</h1>
        <p className="text-muted-foreground">Não foi possível carregar os detalhes da avaliação.</p>
        <Button onClick={goBack}>Voltar para Fila</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <EvaluationHeader proposal={proposal} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ClientInfo client={proposal.client} />
          <ProposalInfo proposal={proposal} />
          <DocumentList documents={proposal.documents || []} />
        </div>
        <div className="space-y-6">
          <HistoryList history={proposal.history} />
        </div>
      </div>

      <DecisionDialogs proposal={proposal} />
    </div>
  );
}

export { ProposalEvaluationPage };
