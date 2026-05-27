import { render, screen, fireEvent } from '@testing-library/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { throwError } from 'rxjs';

import { UserFormDialogComponent } from './user-form-dialog.component';
import { UserService } from '../../../core/services/user.service';

const mockDialogRef = {
  close: vi.fn()
};

const mockUserService = {
  createUser: vi.fn(() => of({})),
  updateUser: vi.fn(() => of({}))
};

describe('UserFormDialogComponent', () => {
  async function setup() {
    return render(UserFormDialogComponent, {
      imports: [NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'create'
          }
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    });
  }

  it('deve renderizar formulário', async () => {
    await setup();

    expect(screen.getByText('Novo Usuário')).toBeTruthy();
  });

  it('deve validar campos obrigatórios', async () => {
    const component = await setup();

    component.fixture.componentInstance.onSubmit();
    component.fixture.detectChanges();

    expect(component.fixture.componentInstance.form.invalid).toBe(true);
  });

  it('deve aplicar máscara de CPF', async () => {
    const component = await setup();

    const input = document.querySelector('input[formControlName="cpf"]') as HTMLInputElement;

    input.value = '12345678900';

    fireEvent.input(input);

    component.fixture.componentInstance.onCpfInput({
      target: input
    } as any);

    expect(component.fixture.componentInstance.form.get('cpf')?.value)
      .toBe('123.456.789-00');
  });

  it('deve fechar modal ao cancelar', async () => {
    const component = await setup();

    component.fixture.componentInstance.onCancel();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });


  it('não deve enviar formulário inválido', async () => {

    const component = await setup();

    const instance = component.fixture.componentInstance;

    instance.onSubmit();

    expect(instance.form.invalid).toBe(true);

  });

  it('deve criar usuário no modo create', async () => {

    const component = await setup();

    const instance = component.fixture.componentInstance;

    vi.spyOn(instance.form, 'invalid', 'get')
      .mockReturnValue(false);

    instance.form.patchValue({
      nome: 'Teste',
      email: 'teste@email.com',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      tipoTelefone: 'celular'
    });

    instance.onSubmit();

    expect(
      mockUserService.createUser
    ).toHaveBeenCalled();

  });

  it('deve marcar cpf inválido', async () => {

    const component = await setup();

    const instance = component.fixture.componentInstance;

    instance.form.patchValue({
      cpf: '111.111.111-11'
    });

    expect(
      instance.form.get('cpf')?.invalid
    ).toBe(true);

  });

  it('deve tratar erro ao criar usuário', async () => {

    mockUserService.createUser.mockReturnValueOnce(
      throwError(() => new Error('Erro'))
    );

    const component = await setup();

    const instance = component.fixture.componentInstance;

    vi.spyOn(instance.form, 'invalid', 'get')
      .mockReturnValue(false);

    instance.onSubmit();

    expect(
      mockUserService.createUser
    ).toHaveBeenCalled();

  });

  it('deve atualizar usuário no modo edit', async () => {

    const component = await render(UserFormDialogComponent, {
      imports: [NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            user: {
              id: 1,
              nome: 'João',
              email: 'joao@email.com',
              cpf: '123.456.789-00',
              telefone: '(11) 99999-9999',
              tipoTelefone: 'celular'
            }
          }
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    });

    const instance = component.fixture.componentInstance;

    vi.spyOn(instance.form, 'invalid', 'get')
      .mockReturnValue(false);

    instance.onSubmit();

    expect(
      mockUserService.updateUser
    ).toHaveBeenCalled();

  });

  it('deve cancelar modal', async () => {

    const component = await setup();

    component.fixture.componentInstance.onCancel();

    expect(
      mockDialogRef.close
    ).toHaveBeenCalled();

  });

  it('deve aplicar máscara no telefone', async () => {

    const component = await setup();

    const instance = component.fixture.componentInstance;

    const input = {
      value: '11999999999'
    };

    instance.onPhoneInput({
      target: input
    } as any);

    expect(
      instance.form.get('telefone')?.value
    ).toContain('(');

  });

  it('deve aplicar máscara de telefone fixo', async () => {

    const component = await setup();

    const instance = component.fixture.componentInstance;

    instance.form.patchValue({
      tipoTelefone: 'fixo'
    });

    instance.onPhoneInput({
      target: {
        value: '1133334444'
      }
    } as any);

    expect(
      instance.form.get('telefone')?.value
    ).toContain('-');

  });

  it('deve retornar sem salvar quando form inválido', async () => {

    mockUserService.createUser.mockClear();

    const component = await setup();

    const instance = component.fixture.componentInstance;

    vi.spyOn(instance.form, 'invalid', 'get')
      .mockReturnValue(true);

    instance.onSubmit();

    expect(
      mockUserService.createUser
    ).not.toHaveBeenCalled();

  });
  
}); 