import {
  Component,
  computed,
  effect,
  output,
  signal
} from '@angular/core';

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Component({
  selector: 'app-carrinho',
  standalone: true,
  template: `
    <h2>Total: {{ total() | currency:'BRL' }}</h2>

    <button (click)="adicionarItem()">
      Adicionar Item
    </button>

    <ul>
      <li *ngFor="let item of itens()">
        {{ item.nome }}
        -
        {{ item.quantidade }}x
        -
        {{ item.preco | currency:'BRL' }}

        <button (click)="removerItem(item.id)">
          Remover
        </button>
      </li>
    </ul>
  `
})
export class CarrinhoComponent {

  // signal da lista de itens
  readonly itens = signal<ItemCarrinho[]>([]);

  // output emitido quando o total mudar
  readonly totalChange = output<number>();

  // computed do valor total
  readonly total = computed(() =>
    this.itens().reduce(
      (acc, item) => acc + (item.preco * item.quantidade),
      0
    )
  );

  constructor() {

    // observa mudança do total
    effect(() => {
      this.totalChange.emit(this.total());
    });

  }

  adicionarItem(): void {

    const novoItem: ItemCarrinho = {
      id: Date.now(),
      nome: 'Produto',
      preco: 100,
      quantidade: 1
    };

    this.itens.update((itens) => [
      ...itens,
      novoItem
    ]);
  }

  removerItem(id: number): void {

    this.itens.update((itens) =>
      itens.filter(item => item.id !== id)
    );
  }
}