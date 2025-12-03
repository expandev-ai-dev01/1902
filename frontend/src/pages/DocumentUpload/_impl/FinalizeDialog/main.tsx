import { useState } from 'react';
import { toast } from 'sonner';
import { useDocumentFinalize } from '@/domain/document';
import { useNavigation } from '@/core/hooks/useNavigation';
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
import { Button } from '@/core/components/button';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { CheckCircle2 } from 'lucide-react';

interface FinalizeDialogProps {
  idCreditRequest: number;
  documentsCount: number;
}

function FinalizeDialog({ idCreditRequest, documentsCount }: FinalizeDialogProps) {
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const { mutateAsync: finalizeDocuments, isPending } = useDocumentFinalize(idCreditRequest);

  const handleFinalize = async () => {
    try {
      await finalizeDocuments();
      toast.success('Documentos finalizados com sucesso!');
      setOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao finalizar documentos';
      const missingCategories = error.response?.data?.data?.missingCategories;

      if (missingCategories && missingCategories.length > 0) {
        toast.error(`Categorias obrigatórias faltando: ${missingCategories.join(', ')}`, {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Finalizar Envio
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar Envio de Documentos</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está prestes a finalizar o envio de <strong>{documentsCount}</strong>{' '}
              documento(s).
            </p>
            <p className="font-semibold text-orange-600">
              ⚠️ Após a finalização, você não poderá mais adicionar, excluir ou modificar
              documentos.
            </p>
            <p>A proposta será enviada automaticamente para análise.</p>
            <p>Tem certeza que deseja continuar?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleFinalize}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <>
                <LoadingSpinner />
                Finalizando...
              </>
            ) : (
              'Confirmar Finalização'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { FinalizeDialog };
