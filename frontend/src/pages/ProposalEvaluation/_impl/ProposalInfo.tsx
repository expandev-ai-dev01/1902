import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/card';
import { Separator } from '@/core/components/separator';
import type { EvaluationDetail } from '@/domain/creditRequest/types';

interface ProposalInfoProps {
  proposal: EvaluationDetail;
}

function ProposalInfo({ proposal }: ProposalInfoProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Proposta</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Valor Solicitado</span>
          <p className="text-primary text-xl font-bold">{formatCurrency(proposal.creditAmount)}</p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Prazo Desejado</span>
          <p className="font-medium">{proposal.paymentTerm}</p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Finalidade</span>
          <p className="font-medium">
            {proposal.purposeCategory} - {proposal.purposeSubcategory}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Forma de Pagamento</span>
          <p className="font-medium">{proposal.paymentMethod}</p>
        </div>

        <div className="col-span-2">
          <Separator className="my-2" />
          <h4 className="mb-4 font-semibold">Análise Financeira</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Renda Mensal</span>
              <p className="font-medium">{formatCurrency(proposal.monthlyIncome)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Renda Comprometida</span>
              <p className="font-medium">{formatCurrency(proposal.committedIncome)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">
                Situação Profissional
              </span>
              <p className="font-medium">{proposal.professionalSituation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ProposalInfo };
