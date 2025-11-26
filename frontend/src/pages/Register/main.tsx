import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClientRegister, useAddressLookup } from '@/domain/client';
import { clientRegisterSchema } from '@/domain/client/validations/client';
import type { ClientRegisterInput, ClientRegisterOutput } from '@/domain/client/types';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Label } from '@/core/components/label';
import { Checkbox } from '@/core/components/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Alert, AlertDescription } from '@/core/components/alert';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { useNavigation } from '@/core/hooks/useNavigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Search } from 'lucide-react';

function RegisterPage() {
  const { navigate } = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClientRegisterInput, any, ClientRegisterOutput>({
    resolver: zodResolver(clientRegisterSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      cpf: '',
      email: '',
      phone: '',
      birthDate: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const { mutateAsync: registerClient, isPending: isRegistering } = useClientRegister();
  const { mutateAsync: lookupAddress, isPending: isLookingUpAddress } = useAddressLookup();

  const zipCode = watch('zipCode');

  const handleZipCodeLookup = async () => {
    if (zipCode?.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    try {
      const addressData = await lookupAddress(zipCode);
      setValue('street', addressData.logradouro);
      setValue('neighborhood', addressData.bairro);
      setValue('city', addressData.localidade);
      setValue('state', addressData.uf);
      toast.success('Endereço encontrado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar CEP');
    }
  };

  const onSubmit = async (data: ClientRegisterOutput) => {
    try {
      await registerClient(data);
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      toast.success('Cadastro realizado com sucesso!');

      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao realizar cadastro';
      toast.error(errorMessage);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Cadastro Realizado!</CardTitle>
            <CardDescription className="text-base">
              Sua conta foi criada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-center">
                Um e-mail de confirmação foi enviado para <strong>{registeredEmail}</strong>.
                Verifique sua caixa de entrada e clique no link para ativar sua conta.
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground text-center text-sm">
              Você será redirecionado para a página de login em 5 segundos...
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Cadastro de Cliente</CardTitle>
          <CardDescription>Preencha os dados abaixo para criar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  aria-invalid={!!errors.fullName}
                  placeholder="João da Silva"
                />
                {errors.fullName && (
                  <p className="text-destructive mt-1 text-sm">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    {...register('cpf')}
                    aria-invalid={!!errors.cpf}
                    placeholder="12345678900"
                    maxLength={11}
                  />
                  {errors.cpf && (
                    <p className="text-destructive mt-1 text-sm">{errors.cpf.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register('birthDate')}
                    aria-invalid={!!errors.birthDate}
                  />
                  {errors.birthDate && (
                    <p className="text-destructive mt-1 text-sm">{errors.birthDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                    placeholder="joao@exemplo.com"
                  />
                  {errors.email && (
                    <p className="text-destructive mt-1 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    aria-invalid={!!errors.phone}
                    placeholder="11987654321"
                    maxLength={11}
                  />
                  {errors.phone && (
                    <p className="text-destructive mt-1 text-sm">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Endereço</h3>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      aria-invalid={!!errors.zipCode}
                      placeholder="12345678"
                      maxLength={8}
                    />
                    {errors.zipCode && (
                      <p className="text-destructive mt-1 text-sm">{errors.zipCode.message}</p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleZipCodeLookup}
                      disabled={isLookingUpAddress || zipCode?.length !== 8}
                      variant="outline"
                    >
                      {isLookingUpAddress ? <LoadingSpinner /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Logradouro *</Label>
                  <Input
                    id="street"
                    {...register('street')}
                    aria-invalid={!!errors.street}
                    placeholder="Rua das Flores"
                  />
                  {errors.street && (
                    <p className="text-destructive mt-1 text-sm">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      {...register('number')}
                      aria-invalid={!!errors.number}
                      placeholder="123"
                    />
                    {errors.number && (
                      <p className="text-destructive mt-1 text-sm">{errors.number.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" {...register('complement')} placeholder="Apto 45" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    {...register('neighborhood')}
                    aria-invalid={!!errors.neighborhood}
                    placeholder="Centro"
                  />
                  {errors.neighborhood && (
                    <p className="text-destructive mt-1 text-sm">{errors.neighborhood.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      aria-invalid={!!errors.city}
                      placeholder="São Paulo"
                    />
                    {errors.city && (
                      <p className="text-destructive mt-1 text-sm">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      {...register('state')}
                      aria-invalid={!!errors.state}
                      placeholder="SP"
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="text-destructive mt-1 text-sm">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      aria-invalid={!!errors.password}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive mt-1 text-sm">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      aria-invalid={!!errors.confirmPassword}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas,
                  minúsculas, números e caracteres especiais.
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  {...register('acceptTerms')}
                  aria-invalid={!!errors.acceptTerms}
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                  Eu aceito os{' '}
                  <a href="#" className="text-primary underline">
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a href="#" className="text-primary underline">
                    Política de Privacidade
                  </a>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-destructive text-sm">{errors.acceptTerms.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <LoadingSpinner />
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Já possui uma conta?{' '}
              <a href="/login" className="text-primary hover:underline">
                Faça login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { RegisterPage };
