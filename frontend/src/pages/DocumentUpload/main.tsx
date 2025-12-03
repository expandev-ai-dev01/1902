import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDocumentList } from '@/domain/document';
import { useCreditRequestDetail } from '@/domain/creditRequest';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { useNavigation } from '@/core/hooks/useNavigation';
import { Button } from '@/core/components/button';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Alert, AlertDescription } from '@/core/components/alert';
import { UploadForm } from './_impl/UploadForm';
import { DocumentList } from './_impl/DocumentList';
import { FinalizeDialog } from './_impl/FinalizeDialog';

function DocumentUploadPage() {
  const { id } = useParams<{ id: string }>();
  const { goBack } = useNavigation();
  const [showUploadForm, setShowUploadForm] = useState(false);

  const { data: proposal, isLoading: isLoadingProposal } = useCreditRequestDetail(Number(id));
  const { data: documentsData, isLoading: isLoadingDocuments } = useDocumentList(Number(id));

  if (isLoadingProposal || isLoadingDocuments) {
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

  if (proposal.status !== 'Aguardando Documentação') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Upload não disponível</h1>
        <p className="text-muted-foreground">Esta proposta não está aguardando documentação.</p>
        <Button onClick={goBack}>Voltar</Button>
      </div>
    );
  }

  const canFinalize =
    documentsData?.missingCategories && documentsData.missingCategories.length === 0;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Upload de Documentos</h1>
          <p className="text-muted-foreground">{proposal.requestNumber}</p>
        </div>
        {canFinalize && (
          <FinalizeDialog
            idCreditRequest={proposal.idCreditRequest}
            documentsCount={documentsData?.documents?.length || 0}
          />
        )}
      </div>

      {documentsData?.missingCategories && documentsData.missingCategories.length > 0 && (
        <Alert>
          <AlertDescription>
            <p className="mb-2 font-semibold">Categorias obrigatórias pendentes:</p>
            <ul className="list-inside list-disc space-y-1">
              {documentsData.missingCategories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {canFinalize && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Todos os documentos obrigatórios foram enviados! Você pode finalizar o envio agora.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {showUploadForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Enviar Novo Documento</CardTitle>
                <CardDescription>Selecione a categoria e faça o upload do arquivo</CardDescription>
              </CardHeader>
              <CardContent>
                <UploadForm
                  idCreditRequest={proposal.idCreditRequest}
                  onSuccess={() => setShowUploadForm(false)}
                  onCancel={() => setShowUploadForm(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowUploadForm(true)} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Enviar Novo Documento
            </Button>
          )}
        </div>

        <div className="lg:col-span-3">
          <DocumentList
            documents={documentsData?.documents || []}
            idCreditRequest={proposal.idCreditRequest}
            canDelete={true}
          />
        </div>
      </div>
    </div>
  );
}

export { DocumentUploadPage };
