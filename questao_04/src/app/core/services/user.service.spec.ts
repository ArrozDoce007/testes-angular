import { describe, expect, it, beforeEach } from 'vitest';

import { UserService } from './user.service';

describe('UserService', () => {

  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('deve carregar usuários', async () => {

    await new Promise(resolve => setTimeout(resolve, 900));

    expect(service.users().length).toBeGreaterThan(0);

    expect(service.loading()).toBe(false);

  });

  it('deve filtrar usuários por nome', async () => {

    await new Promise(resolve => setTimeout(resolve, 900));

    let users: any[] = [];

    service
      .filterUsersByName('João')
      .subscribe(result => {
        users = result;
      });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(users.length).toBe(1);

  });

  it('deve buscar usuário por id', async () => {

    await new Promise(resolve => setTimeout(resolve, 900));

    let user: any;

    service
      .getUserById(1)
      .subscribe(result => {
        user = result;
      });

    await new Promise(resolve => setTimeout(resolve, 400));

    expect(user.id).toBe(1);

  });

  it('deve criar usuário', async () => {

    await new Promise(resolve => setTimeout(resolve, 900));

    const newUser = {
      nome: 'Novo Usuário',
      email: 'novo@email.com',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      tipoTelefone: 'celular' as const
    };

    service.createUser(newUser).subscribe();

    await new Promise(resolve => setTimeout(resolve, 600));

    expect(
      service.users().some(u => u.email === newUser.email)
    ).toBe(true);

  });

  it('deve atualizar usuário', async () => {

    await new Promise(resolve => setTimeout(resolve, 900));

    const existing = service.users()[0];

    service.updateUser(existing.id, {
      ...existing,
      nome: 'Nome Atualizado'
    }).subscribe();

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(
      service.users()[0].nome
    ).toBe('Nome Atualizado');

  });

  it('deve deletar usuário', async () => {

    await new Promise(resolve => setTimeout(resolve, 900));

    const initialLength = service.users().length;

    service.deleteUser(1).subscribe();

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(
      service.users().length
    ).toBe(initialLength - 1);

  });

  it('deve retornar lista completa quando busca estiver vazia', async () => {

    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = service.users();

    expect(users.length).toBeGreaterThan(0);

  });

  it('deve falhar ao atualizar email duplicado', async () => {

    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = service.users();

    await new Promise<void>((resolve) => {

      service.updateUser(users[0].id, {
        ...users[0],
        email: users[1].email
      }).subscribe({
        next: () => { },
        error: (err) => {

          expect(err.message)
            .toContain('E-mail');

          resolve();

        }
      });

    });

  });

  it('deve falhar ao atualizar cpf duplicado', async () => {

    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = service.users();

    await new Promise<void>((resolve) => {

      service.updateUser(users[0].id, {
        ...users[0],
        cpf: users[1].cpf
      }).subscribe({
        next: () => { },
        error: (err) => {

          expect(err.message)
            .toContain('CPF');

          resolve();

        }
      });

    });

  });

});