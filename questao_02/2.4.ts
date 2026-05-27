/**trackBy melhora a performance porque evita que o Angular recrie todos os elementos da lista quando apenas alguns itens mudam.
Sem trackBy, o Angular compara por referência e pode recriar todo o DOM da lista.
Com ele, cada item é identificado por uma chave única (id), reutilizando elementos existentes.

</li *ngFor="let item of itens; trackBy: trackById">
  {{ item.nome }}
</li>

trackById(index: number, item: Item): number {
  return item.id;
}

ChangeDetectionStrategy.OnPush reduz ciclos de detecção porque o Angular só atualiza o componente quando:
um @Input muda de referência;
ocorre um evento;
um observable com async pipe emite;
markForCheck() é chamado.

Isso evita verificações desnecessárias em listas grandes.

Com a estratégia Default, qualquer evento dispara detecção em toda a árvore de componentes.
Em listas com centenas de itens isso aumenta:
uso de CPU;
renderizações;
manipulação de DOM;
risco de lentidão.

A melhor combinação para performance seria: OnPush + trackBy + async pipe.
*/