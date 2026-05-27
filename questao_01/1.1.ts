/**Principais problemas do código antigo:
Uso excessivo de any, perdendo totalmente a segurança de tipos do TypeScript.
Código duplicado para buscar produtos.
Possível erro caso o produto não exista (produto.id pode quebrar).
Uso de for manual quando métodos como find() deixam o código mais limpo.
Comparação usando == ao invés de ===.
Retorno booleano desnecessariamente verboso.
Falta de encapsulamento e imutabilidade.
*/

//VERSÃO MELHORADA:

class Produto {
  constructor(
    public readonly id: number,
    public descricao: string,
    public quantidadeEstoque: number
  ) { }
}

class Verdureira {
  private produtos: Produto[];

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20),
    ];
  }

  private buscarProduto(produtoId: number): Produto | undefined {
    return this.produtos.find(produto => produto.id === produtoId);
  }

  getDescricaoProduto(produtoId: number): string {
    const produto = this.buscarProduto(produtoId);

    if (!produto) {
      return 'Produto não encontrado';
    }

    return `${produto.id} - ${produto.descricao} (${produto.quantidadeEstoque}x)`;
  }

  hasEstoqueProduto(produtoId: number): boolean {
    const produto = this.buscarProduto(produtoId);

    return !!produto && produto.quantidadeEstoque > 0;
  }
}