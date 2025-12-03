import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/card';
import { Button } from '@/core/components/button';
import { Badge } from '@/core/components/badge';
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
import { FileText, Trash2 } from 'lucide-react';
import { formatDate } from '@/core/utils/date';
import { useDocumentDelete } from '@/domain/document';
import { toast } from 'sonner';
import type { Document, DocumentCategory } from '@/domain/document/types';
import { Empty, EmptyDescription, EmptyTitle, EmptyMedia } from '@/core/components/empty';

interface DocumentListProps {
  documents: Document[];
  idCreditRequest: number;
  canDelete: boolean;
}

const categoryColors: Record<DocumentCategory, string> = {
  'Documento de Identificação': 'bg-blue-100 text-blue-800',
  'Comprovante de Renda': 'bg-green-100 text-green-800',
  'Comprovante de Residência': 'bg-purple-100 text-purple-800',
  'Extrato Bancário': 'bg-orange-100 text-orange-800',
  Outros: 'bg-gray-100 text-gray-800',
};

function DocumentList({ documents, idCreditRequest, canDelete }: DocumentListProps) {
  const { mutateAsync: deleteDocument, isPending } = useDocumentDelete(idCreditRequest);

  const handleDelete = async (idDocument: number, fileName: string) => {
    try {
      await deleteDocument(idDocument);
      toast.success(`Documento "${fileName}" excluído com sucesso`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao excluir documento';
      toast.error(errorMessage);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyMedia variant="icon">
              <FileText className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nenhum documento enviado</EmptyTitle>
            <EmptyDescription>
              Você ainda não enviou nenhum documento para esta proposta.
            </EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, Document[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Enviados ({documents.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={categoryColors[category as DocumentCategory]}>{category}</Badge>
              <span className="text-muted-foreground text-sm">({docs.length})</span>
            </div>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.idDocument}
                  className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                      <FileText className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span>{formatDate(doc.uploadDate)}</span>
                        <span>•</span>
                        <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{doc.fileType}</span>
                      </div>
                      {doc.description && (
                        <p className="text-muted-foreground mt-1 text-xs">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o documento "{doc.fileName}"? Esta ação
                            não poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doc.idDocument, doc.fileName)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { DocumentList };
