import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useDocumentUpload } from '@/domain/document';
import { documentUploadSchema, DOCUMENT_CATEGORIES } from '@/domain/document/validations';
import type { DocumentUploadInput, DocumentUploadOutput } from '@/domain/document/types';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Label } from '@/core/components/label';
import { Textarea } from '@/core/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { Alert, AlertDescription } from '@/core/components/alert';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface UploadFormProps {
  idCreditRequest: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function UploadForm({ idCreditRequest, onSuccess, onCancel }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DocumentUploadInput, any, DocumentUploadOutput>({
    resolver: zodResolver(documentUploadSchema),
    mode: 'onBlur',
    defaultValues: {
      category: undefined,
      description: '',
      fileName: '',
      fileSize: 0,
      fileType: undefined,
      fileData: '',
    },
  });

  const { mutateAsync: uploadDocument, isPending } = useDocumentUpload(idCreditRequest);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use PDF, JPG ou PNG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo excede o tamanho máximo de 10MB.');
      return;
    }

    setSelectedFile(file);
    setValue('fileName', file.name);
    setValue('fileSize', file.size);

    const fileTypeMap: Record<string, 'PDF' | 'JPG' | 'PNG'> = {
      'application/pdf': 'PDF',
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
    };
    setValue('fileType', fileTypeMap[file.type]);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1] || '';
      setValue('fileData', base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: DocumentUploadOutput) => {
    try {
      await uploadDocument(data);
      toast.success('Documento enviado com sucesso!');
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar documento';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Categoria do Documento *</Label>
        <Select onValueChange={(value) => setValue('category', value as any)}>
          <SelectTrigger id="category" aria-invalid={!!errors.category}>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Adicione uma descrição para o documento..."
          maxLength={100}
        />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Arquivo *</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          aria-invalid={!!errors.fileData}
        />
        {selectedFile && (
          <p className="text-muted-foreground text-sm">
            Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
            MB)
          </p>
        )}
        {errors.fileData && <p className="text-destructive text-sm">{errors.fileData.message}</p>}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Formatos aceitos: PDF, JPG, PNG</li>
            <li>Tamanho máximo: 10MB</li>
            <li>Resolução mínima para imagens: 300 DPI</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !selectedFile} className="flex-1">
          {isPending ? (
            <>
              <LoadingSpinner />
              Enviando...
            </>
          ) : (
            'Enviar Documento'
          )}
        </Button>
      </div>
    </form>
  );
}

export { UploadForm };
