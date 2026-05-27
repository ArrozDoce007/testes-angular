import { render, screen, fireEvent } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';

import { UserCardComponent } from './user-card.component';

const mockUser = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@email.com',
  cpf: '123.456.789-00',
  telefone: '(11) 99999-9999',
  tipoTelefone: 'celular' as const
};

describe('UserCardComponent', () => {
  it('deve renderizar dados do usuário', async () => {
    await render(UserCardComponent, {
      componentProperties: {
        user: mockUser
      }
    });

    expect(screen.getByText('João Silva')).toBeTruthy();
    expect(screen.getByText('joao@email.com')).toBeTruthy();
    expect(screen.getByText('123.456.789-00')).toBeTruthy();
  });

  it('deve gerar iniciais corretamente', async () => {
    const component = await render(UserCardComponent, {
      componentProperties: {
        user: mockUser
      }
    });

    expect(component.fixture.componentInstance.getInitials()).toBe('JS');
  });

  it('deve emitir evento de edição', async () => {
    const editSpy = vi.fn();

    await render(UserCardComponent, {
      componentProperties: {
        user: mockUser,
        edit: {
          emit: editSpy
        } as any
      }
    });

    const button = screen.getByText('Editar');

    fireEvent.click(button);

    expect(editSpy).toHaveBeenCalled();
  });

  it('deve emitir evento de exclusão', async () => {
    const deleteSpy = vi.fn();

    await render(UserCardComponent, {
      componentProperties: {
        user: mockUser,
        delete: {
          emit: deleteSpy
        } as any
      }
    });

    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[1]);

    expect(deleteSpy).toHaveBeenCalled();
  });

  it('deve retornar vazio quando nome não existir', async () => {

    const component = await render(UserCardComponent, {
      componentProperties: {
        user: {
          id: 1,
          nome: '',
          email: '',
          cpf: '',
          telefone: '',
          tipoTelefone: 'celular'
        }
      }
    });

    expect(
      component.fixture.componentInstance.getInitials()
    ).toBe('');

  });
  
});