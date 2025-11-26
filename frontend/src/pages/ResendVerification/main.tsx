import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResendVerification } from '@/domain/client';
import { resendVerificationSchema } from '@/domain/client/validations/client';
import type { ResendVerificationInput } from '@/domain/client/types';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Label } from '@/core/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Alert, AlertDescription } from '@/core/components/alert';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { useNavigation } from '@/core/hooks/useNavigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { Mail } from 'lucide-react';

function ResendVerificationPage() {
  const { navigate } = useNavigation();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
    mode: 'onBlur',
  });

  const { mutateAsync: resendVerification, isPending } = useResendVerification();

  const onSubmit = async (data: ResendVerificationInput) => {
    try {
      await resendVerification(data);
      setSentEmail(data.email);
      setEmailSent(true);
      toast.success('E-mail de verificação enviado!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar e-mail';
      toast.error(errorMessage);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">E-mail Enviado!</CardTitle>
            <CardDescription>Verifique sua caixa de entrada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-center">
                Um novo e-mail de verificação foi enviado para <strong>{sentEmail}</strong>.
                Verifique sua caixa de entrada e clique no link para ativar sua conta.
              </AlertDescription>
            </Alert>
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
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Reenviar Verificação</CardTitle>
          <CardDescription>
            Informe seu e-mail para receber um novo link de verificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-destructive mt-1 text-sm">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <LoadingSpinner />
                  Enviando...
                </>
              ) : (
                'Enviar E-mail de Verificação'
              )}
            </Button>

            <div className="flex flex-col gap-2 text-center text-sm">
              <a href="/login" className="text-primary hover:underline">
                Voltar para Login
              </a>
              <a
                href="/register"
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                Criar nova conta
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { ResendVerificationPage };
