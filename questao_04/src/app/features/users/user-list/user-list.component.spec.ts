import { render, screen } from '@testing-library/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockUsers = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-9999',
    tipoTelefone: 'celular' as const
  }
];

const mockUserService = {
  users: vi.fn(() => mockUsers),
  loading: vi.fn(() => false),
  error: vi.fn(() => null),
  loadUsers: vi.fn(),
  filterUsersByName: vi.fn(() => of(mockUsers)),
  deleteUser: vi.fn(() => of(true))
};

const mockDialog = {
  open: vi.fn(() => ({
    afterClosed: () => of(true)
  }))
};

const mockSnackBar = {
  open: vi.fn()
};

describe('UserListComponent', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function setup() {
    return render(UserListComponent, {
      imports: [NoopAnimationsModule],

      componentProviders: [
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: MatDialog,
          useValue: mockDialog
        },
        {
          provide: MatSnackBar,
          useValue: mockSnackBar
        }
      ]
    });
  }

  it('deve renderizar o título', async () => {
    await setup();

    expect(
      screen.getByText('Gerenciamento de Usuários')
    ).toBeTruthy();
  });

  it('deve renderizar usuários', async () => {
    await setup();

    expect(
      await screen.findByText('João Silva')
    ).toBeTruthy();
  });

  it('deve limpar busca', async () => {
    const component = await setup();

    component.fixture.componentInstance.searchControl.setValue('teste');

    component.fixture.componentInstance.clearSearch();

    expect(
      component.fixture.componentInstance.searchControl.value
    ).toBe('');
  });

  it('deve chamar loadUsers no retry', async () => {
    const component = await setup();

    component.fixture.componentInstance.retry();

    expect(mockUserService.loadUsers).toHaveBeenCalled();
  });

  it('deve abrir modal de criação', async () => {
    const component = await setup();

    component.fixture.componentInstance.openCreateDialog();

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('deve abrir modal de edição', async () => {
    const component = await setup();

    component.fixture.componentInstance.openEditDialog(mockUsers[0]);

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('deve deletar usuário', async () => {
    const component = await setup();

    component.fixture.componentInstance.deleteUser(mockUsers[0]);

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('deve buscar com valor vazio', async () => {

    const component = await setup();

    const instance = component.fixture.componentInstance;

    instance.searchControl.setValue('');

    expect(
      instance.searchControl.value
    ).toBe('');

  });

  it('deve abrir snackbar ao deletar usuário', async () => {

    const component = await setup();

    component.fixture.componentInstance.deleteUser(mockUsers[0]);

    expect(
      mockSnackBar.open
    ).toHaveBeenCalled();

  });

});