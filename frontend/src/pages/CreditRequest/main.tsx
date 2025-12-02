import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreditRequestCreate } from '@/domain/creditRequest';
import {
  creditRequestSchema,
  SUBCATEGORIES,
  PURPOSE_CATEGORIES,
  PAYMENT_TERMS,
  PAYMENT_METHODS,
  PROFESSIONAL_SITUATIONS,
} from '@/domain/creditRequest/validations/creditRequest';
import type { CreditRequestFormInput, CreditRequestFormOutput } from '@/domain/creditRequest/types';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Label } from '@/core/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Alert, AlertDescription } from '@/core/components/alert';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { useNavigation } from '@/core/hooks/useNavigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { CheckCircle2, DollarSign } from 'lucide-react';

function CreditRequestPage() {
  const { navigate } = useNavigation();
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'CONSUMO' | 'INVESTIMENTO' | 'IMÓVEL' | 'VEÍCULO' | ''
  >('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreditRequestFormInput, any, CreditRequestFormOutput>({
    resolver: zodResolver(creditRequestSchema),
    mode: 'onBlur',
    defaultValues: {
      creditAmount: 0,
      purposeCategory: undefined,
      purposeSubcategory: '',
      paymentTerm: undefined,
      paymentMethod: undefined,
      monthlyIncome: 0,
      committedIncome: 0,
      professionalSituation: undefined,
      bankCode: '',
      branchNumber: '',
      accountNumber: '',
    },
  });

  const { mutateAsync: createCreditRequest, isPending } = useCreditRequestCreate();

  const monthlyIncome = watch('monthlyIncome');
  const committedIncome = watch('committedIncome');

  const handleCategoryChange = (value: string) => {
    const category = value as 'CONSUMO' | 'INVESTIMENTO' | 'IMÓVEL' | 'VEÍCULO';
    setSelectedCategory(category);
    setValue('purposeCategory', category);
    setValue('purposeSubcategory', '');
  };

  const onSubmit = async (data: CreditRequestFormOutput) => {
    try {
      const result = await createCreditRequest(data);
      setRequestNumber(result.requestNumber);
      setRequestSuccess(true);
      toast.success('Solicitação de crédito enviada com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar solicitação';
      toast.error(errorMessage);
    }
  };

  if (requestSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Solicitação Enviada!</CardTitle>
            <CardDescription className="text-base">
              Sua solicitação de crédito foi registrada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
              <div className="mb-2 text-center text-sm font-medium text-green-800">
                Número do Protocolo
              </div>
              <div className="text-center text-2xl font-bold text-green-900">{requestNumber}</div>
            </div>

            <Alert>
              <AlertDescription className="text-center">
                <p className="mb-2 font-semibold">Próximos Passos:</p>
                <ul className="space-y-1 text-left text-sm">
                  <li>• Sua solicitação está com status "Em Análise"</li>
                  <li>• Nossa equipe irá avaliar os dados fornecidos</li>
                  <li>• Você pode acompanhar o status no painel de acompanhamento</li>
                  <li>• Em breve você receberá uma resposta sobre sua solicitação</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Ir para Painel de Acompanhamento
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Fazer Nova Solicitação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-3xl">Solicitação de Crédito</CardTitle>
              <CardDescription>Preencha os dados para solicitar seu crédito</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Informações do Crédito</h3>

              <div>
                <Label htmlFor="creditAmount">Valor do Crédito Desejado *</Label>
                <Input
                  id="creditAmount"
                  type="number"
                  step="0.01"
                  {...register('creditAmount', { valueAsNumber: true })}
                  aria-invalid={!!errors.creditAmount}
                  placeholder="10000.00"
                />
                {errors.creditAmount && (
                  <p className="text-destructive mt-1 text-sm">{errors.creditAmount.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="purposeCategory">Categoria da Finalidade *</Label>
                  <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger id="purposeCategory" aria-invalid={!!errors.purposeCategory}>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {PURPOSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.purposeCategory && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.purposeCategory.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="purposeSubcategory">Subcategoria da Finalidade *</Label>
                  <Select
                    onValueChange={(value) => setValue('purposeSubcategory', value)}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger
                      id="purposeSubcategory"
                      aria-invalid={!!errors.purposeSubcategory}
                    >
                      <SelectValue placeholder="Selecione a subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory &&
                        SUBCATEGORIES[selectedCategory].map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.purposeSubcategory && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.purposeSubcategory.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="paymentTerm">Prazo de Pagamento *</Label>
                  <Select onValueChange={(value) => setValue('paymentTerm', value as any)}>
                    <SelectTrigger id="paymentTerm" aria-invalid={!!errors.paymentTerm}>
                      <SelectValue placeholder="Selecione o prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentTerm && (
                    <p className="text-destructive mt-1 text-sm">{errors.paymentTerm.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                  <Select onValueChange={(value) => setValue('paymentMethod', value as any)}>
                    <SelectTrigger id="paymentMethod" aria-invalid={!!errors.paymentMethod}>
                      <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-destructive mt-1 text-sm">{errors.paymentMethod.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Informações Financeiras</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="monthlyIncome">Renda Mensal Líquida *</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    step="0.01"
                    {...register('monthlyIncome', { valueAsNumber: true })}
                    aria-invalid={!!errors.monthlyIncome}
                    placeholder="5000.00"
                  />
                  {errors.monthlyIncome && (
                    <p className="text-destructive mt-1 text-sm">{errors.monthlyIncome.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="committedIncome">Renda Comprometida *</Label>
                  <Input
                    id="committedIncome"
                    type="number"
                    step="0.01"
                    {...register('committedIncome', { valueAsNumber: true })}
                    aria-invalid={!!errors.committedIncome}
                    placeholder="0.00"
                  />
                  {errors.committedIncome && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.committedIncome.message}
                    </p>
                  )}
                </div>
              </div>

              {monthlyIncome > 0 && committedIncome >= 0 && (
                <Alert>
                  <AlertDescription>
                    <div className="flex justify-between text-sm">
                      <span>Renda Disponível:</span>
                      <span className="font-semibold">
                        R$ {(monthlyIncome - committedIncome).toFixed(2)}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="professionalSituation">Situação Profissional *</Label>
                <Select onValueChange={(value) => setValue('professionalSituation', value as any)}>
                  <SelectTrigger
                    id="professionalSituation"
                    aria-invalid={!!errors.professionalSituation}
                  >
                    <SelectValue placeholder="Selecione sua situação" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_SITUATIONS.map((situation) => (
                      <SelectItem key={situation} value={situation}>
                        {situation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.professionalSituation && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.professionalSituation.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Dados Bancários para Depósito</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="bankCode">Código do Banco *</Label>
                  <Input
                    id="bankCode"
                    {...register('bankCode')}
                    aria-invalid={!!errors.bankCode}
                    placeholder="001"
                    maxLength={3}
                  />
                  {errors.bankCode && (
                    <p className="text-destructive mt-1 text-sm">{errors.bankCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="branchNumber">Agência *</Label>
                  <Input
                    id="branchNumber"
                    {...register('branchNumber')}
                    aria-invalid={!!errors.branchNumber}
                    placeholder="1234"
                    maxLength={5}
                  />
                  {errors.branchNumber && (
                    <p className="text-destructive mt-1 text-sm">{errors.branchNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountNumber">Conta *</Label>
                  <Input
                    id="accountNumber"
                    {...register('accountNumber')}
                    aria-invalid={!!errors.accountNumber}
                    placeholder="12345-6"
                    maxLength={12}
                  />
                  {errors.accountNumber && (
                    <p className="text-destructive mt-1 text-sm">{errors.accountNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <p className="text-sm">
                  <strong>Importante:</strong> Todos os campos marcados com * são obrigatórios.
                  Certifique-se de que todas as informações estão corretas antes de enviar.
                </p>
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <LoadingSpinner />
                  Enviando Solicitação...
                </>
              ) : (
                'Enviar Solicitação de Crédito'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { CreditRequestPage };
