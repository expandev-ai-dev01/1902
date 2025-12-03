import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/card';
import { Separator } from '@/core/components/separator';
import type { Client } from '@/domain/client/types';
import { formatDate } from '@/core/utils/date';

interface ClientInfoProps {
  client: Client;
}

function ClientInfo({ client }: ClientInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Nome Completo</span>
          <p className="font-medium">{client.fullName}</p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">CPF</span>
          <p className="font-medium">{client.cpf}</p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">E-mail</span>
          <p className="font-medium">{client.email}</p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Telefone</span>
          <p className="font-medium">{client.phone}</p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm font-medium">Data de Nascimento</span>
          <p className="font-medium">{formatDate(client.birthDate)}</p>
        </div>
        <div className="col-span-2">
          <Separator className="my-2" />
          <span className="text-muted-foreground mb-2 block text-sm font-medium">Endereço</span>
          <p className="text-sm">
            {client.street}, {client.number} {client.complement && `- ${client.complement}`}
            <br />
            {client.neighborhood} - {client.city}/{client.state}
            <br />
            CEP: {client.zipCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { ClientInfo };
