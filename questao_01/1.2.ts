//FILTRAGEM:

type PaginaParams = {
  pagina: number;
  tamanho: number;
};

type Pagina<T> = {
  itens: T[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
};

function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  const { pagina, tamanho } = params;

  // Filtra os dados
  const filtrados = data.filter(filterFn);

  // Calcula os índices da paginação
  const inicio = (pagina - 1) * tamanho;
  const fim = inicio + tamanho;

  // Seleciona os itens da página atual
  const itens = filtrados.slice(inicio, fim);

  return {
    itens,
    total: filtrados.length,
    pagina,
    tamanho,
    totalPaginas: Math.ceil(filtrados.length / tamanho),
  };
}

// EXEMPLO CONCRETO:

type Usuario = {
  id: number;
  nome: string;
  ativo: boolean;
};

const usuarios: Usuario[] = [
  { id: 1, nome: "Ana", ativo: true },
  { id: 2, nome: "Carlos", ativo: false },
  { id: 3, nome: "Marina", ativo: true },
  { id: 4, nome: "João", ativo: true },
  { id: 5, nome: "Fernanda", ativo: false },
  { id: 6, nome: "Pedro", ativo: true },
];

// Filtra apenas usuários ativos
const resultado = filtrarEPaginar<Usuario>(
  usuarios,
  (usuario) => usuario.ativo,
  {
    pagina: 1,
    tamanho: 2,
  }
);

console.log("Resultado da paginação:");
console.log(resultado);