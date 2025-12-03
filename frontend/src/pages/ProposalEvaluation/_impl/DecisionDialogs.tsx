import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, RotateCcw, Calculator } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/dialog';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Label } from '@/core/components/label';
import { Textarea } from '@/core/components/textarea';
import { Checkbox } from '@/core/components/checkbox';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { useNavigation } from '@/core/hooks/useNavigation';

import {
  useApproveProposal,
  useRejectProposal,
  useReturnProposal,
} from '@/domain/creditRequest/hooks';
import {
  approveProposalSchema,
  rejectProposalSchema,
  returnProposalSchema,
} from '@/domain/creditRequest/validations';
import type {
  EvaluationDetail,
  ApproveProposalOutput,
  RejectProposalOutput,
  ReturnProposalOutput,
} from '@/domain/creditRequest/types';

interface DecisionDialogsProps {
  proposal: EvaluationDetail;
}

function DecisionDialogs({ proposal }: DecisionDialogsProps) {
  const { navigate } = useNavigation();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  // Approve Form
  const {
    register: registerApprove,
    handleSubmit: handleSubmitApprove,
    watch: watchApprove,
    formState: { errors: errorsApprove },
  } = useForm<ApproveProposalOutput>({
    resolver: zodResolver(approveProposalSchema),
    defaultValues: {
      approvedAmount: proposal.creditAmount,
      interestRate: 1.5,
      finalTerm: Number(proposal.paymentTerm.replace(/\D/g, '')) || 12,
    },
  });

  const { mutateAsync: approve, isPending: isApproving } = useApproveProposal();

  const approvedAmount = watchApprove('approvedAmount');
  const interestRate = watchApprove('interestRate');
  const finalTerm = watchApprove('finalTerm');
  const [installmentValue, setInstallmentValue] = useState(0);

  useEffect(() => {
    if (approvedAmount && interestRate && finalTerm) {
      const i = interestRate / 100;
      const pmt = (approvedAmount * i) / (1 - Math.pow(1 + i, -finalTerm));
      setInstallmentValue(pmt);
    } else {
      setInstallmentValue(0);
    }
  }, [approvedAmount, interestRate, finalTerm]);

  const onApprove = async (data: ApproveProposalOutput) => {
    try {
      await approve({ id: proposal.idCreditRequest, data });
      toast.success('Proposta aprovada com sucesso!');
      setApproveOpen(false);
      navigate('/analysis/queue');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao aprovar proposta');
    }
  };

  // Reject Form
  const {
    register: registerReject,
    handleSubmit: handleSubmitReject,
    formState: { errors: errorsReject },
  } = useForm<RejectProposalOutput>({
    resolver: zodResolver(rejectProposalSchema),
  });

  const { mutateAsync: reject, isPending: isRejecting } = useRejectProposal();

  const onReject = async (data: RejectProposalOutput) => {
    try {
      await reject({ id: proposal.idCreditRequest, data });
      toast.success('Proposta reprovada com sucesso!');
      setRejectOpen(false);
      navigate('/analysis/queue');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao reprovar proposta');
    }
  };

  // Return Form
  const {
    register: registerReturn,
    handleSubmit: handleSubmitReturn,
    setValue: setValueReturn,
    watch: watchReturn,
    formState: { errors: errorsReturn },
  } = useForm<ReturnProposalOutput>({
    resolver: zodResolver(returnProposalSchema),
    defaultValues: {
      documentsToCorrect: [],
      correctionInstructions: '',
    },
  });

  const { mutateAsync: returnProposal, isPending: isReturning } = useReturnProposal();
  const selectedDocs = watchReturn('documentsToCorrect');

  const toggleDocument = (docId: number) => {
    const current = selectedDocs || [];
    if (current.includes(docId)) {
      setValueReturn(
        'documentsToCorrect',
        current.filter((id) => id !== docId)
      );
    } else {
      setValueReturn('documentsToCorrect', [...current, docId]);
    }
  };

  const onReturn = async (data: ReturnProposalOutput) => {
    try {
      await returnProposal({ id: proposal.idCreditRequest, data });
      toast.success('Proposta devolvida para correção!');
      setReturnOpen(false);
      navigate('/analysis/queue');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao devolver proposta');
    }
  };

  return (
    <div className="bg-background fixed bottom-0 left-0 right-0 border-t p-4 shadow-lg lg:pl-64">
      <div className="container mx-auto flex items-center justify-end gap-4">
        {/* Return Dialog */}
        <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Devolver para Correção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Devolver para Correção</DialogTitle>
              <DialogDescription>
                Selecione os documentos que precisam ser corrigidos e forneça instruções.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReturn(onReturn)} className="space-y-4">
              <div className="space-y-2">
                <Label>Documentos para Correção</Label>
                <div className="grid gap-2 rounded-md border p-4">
                  {proposal.documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={selectedDocs?.includes(Number(doc.id))}
                        onCheckedChange={() => toggleDocument(Number(doc.id))}
                      />
                      <Label htmlFor={`doc-${doc.id}`} className="font-normal">
                        {doc.name}
                      </Label>
                    </div>
                  ))}
                  {(!proposal.documents || proposal.documents.length === 0) && (
                    <p className="text-muted-foreground text-sm">Nenhum documento disponível.</p>
                  )}
                </div>
                {errorsReturn.documentsToCorrect && (
                  <p className="text-destructive text-sm">
                    {errorsReturn.documentsToCorrect.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções</Label>
                <Textarea
                  id="instructions"
                  {...registerReturn('correctionInstructions')}
                  placeholder="Descreva o que precisa ser corrigido..."
                />
                {errorsReturn.correctionInstructions && (
                  <p className="text-destructive text-sm">
                    {errorsReturn.correctionInstructions.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setReturnOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isReturning}>
                  {isReturning ? <LoadingSpinner /> : 'Confirmar Devolução'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Reprovar Proposta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reprovar Proposta</DialogTitle>
              <DialogDescription>
                Informe o motivo da reprovação. Esta ação não poderá ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReject(onReject)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo da Reprovação</Label>
                <Textarea
                  id="reason"
                  {...registerReject('rejectionReason')}
                  placeholder="Justifique a reprovação..."
                  className="min-h-[100px]"
                />
                {errorsReject.rejectionReason && (
                  <p className="text-destructive text-sm">{errorsReject.rejectionReason.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setRejectOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" disabled={isRejecting}>
                  {isRejecting ? <LoadingSpinner /> : 'Confirmar Reprovação'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprovar Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Aprovar Proposta</DialogTitle>
              <DialogDescription>
                Defina as condições finais para aprovação do crédito.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitApprove(onApprove)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor Aprovado (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...registerApprove('approvedAmount', { valueAsNumber: true })}
                  />
                  {errorsApprove.approvedAmount && (
                    <p className="text-destructive text-sm">
                      {errorsApprove.approvedAmount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Taxa de Juros (% a.m.)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    {...registerApprove('interestRate', { valueAsNumber: true })}
                  />
                  {errorsApprove.interestRate && (
                    <p className="text-destructive text-sm">{errorsApprove.interestRate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Prazo (meses)</Label>
                  <Input
                    id="term"
                    type="number"
                    {...registerApprove('finalTerm', { valueAsNumber: true })}
                  />
                  {errorsApprove.finalTerm && (
                    <p className="text-destructive text-sm">{errorsApprove.finalTerm.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Parcela Estimada</Label>
                  <div className="bg-muted flex h-9 items-center rounded-md border px-3 font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      installmentValue
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <Calculator className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  O valor da parcela é calculado automaticamente com base nas condições informadas
                  (Sistema Price).
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setApproveOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isApproving}
                >
                  {isApproving ? <LoadingSpinner /> : 'Confirmar Aprovação'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export { DecisionDialogs };
