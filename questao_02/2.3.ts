/**debounceTime(500)
Aguarda 500ms após o usuário parar de digitar antes de disparar a busca.

distinctUntilChanged()
Evita chamadas repetidas caso o texto digitado seja igual ao anterior.

switchMap()
Cancela automaticamente a requisição anterior quando uma nova busca acontece.
Isso evita:
race condition
respostas fora de ordem
requisições desnecessárias

finalize()
Controla o estado de loading:
ativa antes da requisição
desativa quando termina

takeUntil()
Evita memory leaks encerrando o fluxo ao destruir o componente
*/

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Produto {
    id: number;
    nome: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProdutoService {

    buscarProdutos(termo: string): Observable<Produto[]> {

        const produtosMock: Produto[] = [
            { id: 1, nome: 'Notebook' },
            { id: 2, nome: 'Mouse' },
            { id: 3, nome: 'Monitor' },
            { id: 4, nome: 'Teclado' },
        ];

        const resultado = produtosMock.filter(produto =>
            produto.nome.toLowerCase().includes(termo.toLowerCase())
        );

        // simula delay de API
        return of(resultado).pipe(delay(1500));
    }
}

import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';

import {
    BehaviorSubject,
    Observable,
    Subject
} from 'rxjs';

import {
    debounceTime,
    distinctUntilChanged,
    finalize,
    switchMap,
    takeUntil,
    tap
} from 'rxjs/operators';

import {
    Produto,
    ProdutoService
} from './produto.service';

@Component({
    selector: 'app-busca',
    templateUrl: './busca.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscaComponent implements OnInit, OnDestroy {

    private readonly destroy$ = new Subject<void>();

    private readonly termoBusca$ = new BehaviorSubject<string>('');

    readonly loading$ = new BehaviorSubject<boolean>(false);

    produtos$!: Observable<Produto[]>;

    constructor(
        private readonly produtoService: ProdutoService
    ) { }

    ngOnInit(): void {

        this.produtos$ = this.termoBusca$.pipe(

            debounceTime(500),

            distinctUntilChanged(),

            tap(() => this.loading$.next(true)),

            switchMap((termo) =>
                this.produtoService.buscarProdutos(termo).pipe(
                    finalize(() => this.loading$.next(false))
                )
            ),

            takeUntil(this.destroy$)
        );
    }

    buscar(event: Event): void {

        const input = event.target as HTMLInputElement;

        this.termoBusca$.next(input.value);
    }

    ngOnDestroy(): void {

        this.destroy$.next();
        this.destroy$.complete();

    }
}