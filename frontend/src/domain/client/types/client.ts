export interface Client {
  idClient: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  profile: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}
