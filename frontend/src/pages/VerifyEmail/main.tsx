import { useEffect, useState } from 'react';
import { useEmailVerification } from '@/domain/client';
import { useNavigation } from '@/core/hooks/useNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Button } from '@/core/components/button';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { Alert, AlertDescription } from '@/core/components/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailPage() {
  const { navigate, location } = useNavigation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const { mutateAsync: verifyEmail } = useEmailVerification();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Token de verificação não encontrado');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setVerificationStatus('error');
        const message = error.response?.data?.message || 'Erro ao verificar e-mail';
        setErrorMessage(message);
      }
    };

    verify();
  }, [location.search, verifyEmail, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          {verificationStatus === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <LoadingSpinner className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl">Verificando E-mail</CardTitle>
              <CardDescription>Aguarde enquanto verificamos seu e-mail...</CardDescription>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">E-mail Verificado!</CardTitle>
              <CardDescription>Sua conta foi ativada com sucesso</CardDescription>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Erro na Verificação</CardTitle>
              <CardDescription>Não foi possível verificar seu e-mail</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {verificationStatus === 'success' && (
            <>
              <Alert>
                <AlertDescription className="text-center">
                  Você será redirecionado para a página de login em 3 segundos...
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir para Login
              </Button>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/resend-verification')} className="w-full">
                  Reenviar E-mail de Verificação
                </Button>
                <Button onClick={() => navigate('/register')} variant="outline" className="w-full">
                  Voltar para Cadastro
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { VerifyEmailPage };
