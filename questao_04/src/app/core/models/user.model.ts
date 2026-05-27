export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoTelefone: TipoTelefone;
}

export type TipoTelefone = 'celular' | 'residencial' | 'comercial';

export interface UserFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoTelefone: TipoTelefone;
}
