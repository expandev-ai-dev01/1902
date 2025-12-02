import { useParams } from 'react-router-dom';
import { useCreditRequestDetail, useCreditRequestCancel } from '@/domain/creditRequest';
import { Button } from '@/core/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Badge } from '@/core/components/badge';
import { Separator } from '@/core/components/separator';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/core/components/alert-dialog';
import { useNavigation } from '@/core/hooks/useNavigation';
import { formatDate } from '@/core/utils/date';
import { ArrowLeft, Download, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { RequestStatus } from '@/domain/creditRequest/types';

const statusColors: Record<RequestStatus, string> = {
  Rascunho: 'bg-gray-100 text-gray-800',
  'Aguardando Documentação': 'bg-yellow-100 text-yellow-800',
  'Em Análise': 'bg-blue-100 text-blue-800',
  Aprovado: 'bg-green-100 text-green-800',
  Reprovado: 'bg-red-100 text-red-800',
  Cancelado: 'bg-gray-800 text-white',
  Efetivada: 'bg-emerald-100 text-emerald-800',
};

function ProposalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { goBack, navigate } = useNavigation();
  const { data: proposal, isLoading } = useCreditRequestDetail(Number(id));
  const { mutateAsync: cancelProposal, isPending: isCancelling } = useCreditRequestCancel();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Proposta não encontrada</h1>
        <Button onClick={goBack}>Voltar</Button>
      </div>
    );
  }

  const handleCancel = async () => {
    try {
      await cancelProposal(proposal.idCreditRequest);
      toast.success('Proposta cancelada com sucesso');
    } catch (error) {
      toast.error('Erro ao cancelar proposta');
    }
  };

  const canCancel = ['Rascunho', 'Aguardando Documentação', 'Em Análise'].includes(proposal.status);
  const canUpload = proposal.status === 'Aguardando Documentação';
  const canDownload = ['Aprovado', 'Efetivada'].includes(proposal.status);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes da Proposta</h1>
          <p className="text-muted-foreground">{proposal.requestNumber}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {canUpload && (
            <Button onClick={() => navigate(`/documents/${proposal.idCreditRequest}`)}>
              <Upload className="mr-2 h-4 w-4" />
              Enviar Documentos
            </Button>
          )}
          {canDownload && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Comprovante
            </Button>
          )}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Proposta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Proposta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar esta proposta? Esta ação não poderá ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data da Solicitação</span>
              <span>{formatDate(proposal.requestDate)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Solicitado</span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  proposal.creditAmount
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prazo Desejado</span>
              <span>{proposal.paymentTerm}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Finalidade</span>
              <span>
                {proposal.purposeCategory} - {proposal.purposeSubcategory}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renda Mensal</span>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  proposal.monthlyIncome
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renda Comprometida</span>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  proposal.committedIncome
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Situação Profissional</span>
              <span>{proposal.professionalSituation}</span>
            </div>
          </CardContent>
        </Card>

        {proposal.status === 'Reprovado' && proposal.rejectionReason && (
          <Card className="border-red-200 bg-red-50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-red-800">Motivo da Recusa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{proposal.rejectionReason}</p>
            </CardContent>
          </Card>
        )}

        {(proposal.status === 'Aprovado' || proposal.status === 'Efetivada') &&
          proposal.approvedConditions && (
            <Card className="border-green-200 bg-green-50 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-green-800">Condições Aprovadas</CardTitle>
                <CardDescription className="text-green-700">
                  Estas são as condições finais para o seu crédito
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div>
                  <span className="text-sm text-green-700">Valor Aprovado</span>
                  <p className="text-xl font-bold text-green-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(proposal.approvedConditions.approvedAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-green-700">Taxa de Juros</span>
                  <p className="text-xl font-bold text-green-900">
                    {proposal.approvedConditions.interestRate}% a.m.
                  </p>
                </div>
                <div>
                  <span className="text-sm text-green-700">Prazo</span>
                  <p className="text-xl font-bold text-green-900">
                    {proposal.approvedConditions.finalTerm} meses
                  </p>
                </div>
                <div>
                  <span className="text-sm text-green-700">Parcela</span>
                  <p className="text-xl font-bold text-green-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(proposal.approvedConditions.installmentValue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

export { ProposalDetailsPage };
