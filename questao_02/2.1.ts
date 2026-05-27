/**Com OnPush, o Angular não executa a detecção de mudanças automaticamente em qualquer alteração de propriedade
Ele só atualiza a view em situações específicas como:
mudança de referência em @Input
eventos do template (click, input, etc.)
execução manual da detecção (markForCheck, detectChanges)
uso do async pipe

No componente, o valor de texto é alterado dentro do subscribe, mas isso não garante que o Angular 
execute a detecção de mudanças para esse componente com OnPush.
*/

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injectable,
    OnInit,
    OnDestroy
} from '@angular/core';

import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
class PessoaService {
    buscarPorId(id: number) {
        return of({ id, nome: 'João' }).pipe(delay(500));
    }
}

@Component({
    selector: 'app-root',
    providers: [PessoaService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<h1>{{ texto }}</h1>`,
})
export class AppComponent implements OnInit, OnDestroy {

    texto: string;
    contador = 0;
    subscriptionBuscarPessoa: Subscription;

    constructor(
        private readonly pessoaService: PessoaService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {

        this.subscriptionBuscarPessoa =
            this.pessoaService.buscarPorId(1).subscribe((pessoa) => {

                this.texto = `Nome: ${pessoa.nome}`;

                // força o Angular a verificar o componente
                //o subscribe recebe o valor
                //texto é atualizado
                //o componente é marcado para verificação
                //a view rende  riza corretamente:
                this.cdr.markForCheck();
            });

        setInterval(() => this.contador++, 1000);
    }

    ngOnDestroy(): void {
        this.subscriptionBuscarPessoa?.unsubscribe();
    }
}