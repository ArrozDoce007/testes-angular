/**switchMap é uma boa escolha porque:
ele encadeia observables de forma limpa;
cancela automaticamente a requisição anterior caso uma nova emissão aconteça;
evita subscriptions internas e reduz risco de memory leak.
*/

import { Subject } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';

export class AppComponent implements OnInit, OnDestroy {

    texto: string;

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly pessoaService: PessoaService) { }

    ngOnInit(): void {

        const pessoaId = 1;

        this.pessoaService.buscarPorId(pessoaId).pipe(

            switchMap((pessoa) =>

                this.pessoaService.buscarQuantidadeFamiliares(pessoaId).pipe(

                    map((qtd) => ({
                        nome: pessoa.nome,
                        qtd
                    }))
                )
            ),
            //takeUntil
            //Evita memory leaks encerrando automaticamente a subscription quando o componente for destruído.
            takeUntil(this.destroy$)

        ).subscribe(({ nome, qtd }) => {

            this.texto = `Nome: ${nome} | familiares: ${qtd}`;

        });
    }

    ngOnDestroy(): void {

        this.destroy$.next();
        this.destroy$.complete();

    }
}