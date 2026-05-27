import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject, delay, catchError, map, switchMap, forkJoin } from 'rxjs';
import { User, UserFormData } from '../models/user.model';

// Dados mockados de usuários
const MOCK_USERS: User[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    cpf: '881.346.276-09',
    telefone: '(11) 99999-1234',
    tipoTelefone: 'celular'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    cpf: '987.654.321-00',
    telefone: '(11) 3333-4567',
    tipoTelefone: 'residencial'
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    cpf: '271.006.788-97',
    telefone: '(21) 98888-5678',
    tipoTelefone: 'celular'
  },
  {
    id: 4,
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    cpf: '743.793.613-57',
    telefone: '(31) 4444-9876',
    tipoTelefone: 'comercial'
  },
  {
    id: 5,
    nome: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    cpf: '216.615.298-87',
    telefone: '(41) 97777-3456',
    tipoTelefone: 'celular'
  },
  {
    id: 6,
    nome: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    cpf: '267.850.833-11',
    telefone: '(51) 5555-6789',
    tipoTelefone: 'residencial'
  }
];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Estado usando Signals (Angular 17+)
  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals para estado derivado
  readonly users = computed(() => this.usersSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly userCount = computed(() => this.usersSignal().length);

  // BehaviorSubject para operações reativas com RxJS
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  private nextId = MOCK_USERS.length + 1;

  constructor() {
    // Inicializa o estado
    this.loadUsers();
  }

  /**
   * Carrega todos os usuários
   * Utiliza: delay (simula latência), catchError (tratamento de erros)
   */
  loadUsers(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.fetchUsers().subscribe({
      next: (users) => {
        this.usersSignal.set(users);
        this.usersSubject.next(users);
        this.loadingSignal.set(false);
      },
      error: (error) => {
        this.errorSignal.set(error.message);
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Busca usuários da API mockada
   * Operadores RxJS: delay, catchError
   */
  private fetchUsers(): Observable<User[]> {
    return of([...MOCK_USERS]).pipe(
      delay(800), // Simula latência de rede
      catchError((error) => {
        console.error('Erro ao buscar usuários:', error);
        return throwError(() => new Error('Falha ao carregar usuários. Tente novamente.'));
      })
    );
  }

  /**
   * Busca um usuário por ID
   * Operadores RxJS: switchMap, map, catchError
   */
  getUserById(id: number): Observable<User | undefined> {
    return this.users$.pipe(
      switchMap((users) => {
        const user = users.find(u => u.id === id);
        if (user) {
          return of(user);
        }
        // Se não encontrou no cache, busca da API
        return this.fetchUserById(id);
      }),
      catchError((error) => {
        console.error('Erro ao buscar usuário:', error);
        return throwError(() => new Error('Falha ao buscar usuário.'));
      })
    );
  }

  /**
   * Busca usuário específico da API mockada
   */
  private fetchUserById(id: number): Observable<User | undefined> {
    return of(MOCK_USERS.find(u => u.id === id)).pipe(
      delay(300)
    );
  }

  /**
   * Filtra usuários por nome
   * Operadores RxJS: map
   */
  filterUsersByName(searchTerm: string): Observable<User[]> {
    return this.users$.pipe(
      map((users) => {
        if (!searchTerm.trim()) {
          return users;
        }
        const term = searchTerm.toLowerCase().trim();
        return users.filter(user => 
          user.nome.toLowerCase().includes(term)
        );
      })
    );
  }

  /**
   * Cria um novo usuário
   * Operadores RxJS: switchMap, delay, catchError
   */
  createUser(userData: UserFormData): Observable<User> {
    this.loadingSignal.set(true);

    const newUser: User = {
      ...userData,
      id: this.nextId++
    };

    return of(newUser).pipe(
      delay(500), // Simula latência de API
      switchMap((user) => {
        // Atualiza o estado local
        const currentUsers = this.usersSignal();
        const updatedUsers = [...currentUsers, user];
        this.usersSignal.set(updatedUsers);
        this.usersSubject.next(updatedUsers);
        this.loadingSignal.set(false);
        return of(user);
      }),
      catchError((error) => {
        console.error(error);
        this.loadingSignal.set(false);
        this.errorSignal.set('Falha ao criar usuário.');
        return throwError(() => new Error('Falha ao criar usuário.'));
      })
    );
  }

  /**
   * Atualiza um usuário existente
   * Operadores RxJS: switchMap, forkJoin, delay, catchError
   */
  updateUser(id: number, userData: UserFormData): Observable<User> {
    this.loadingSignal.set(true);

    const updatedUser: User = {
      ...userData,
      id
    };

    // Exemplo de forkJoin: simulando validação paralela antes de salvar
    return forkJoin({
      emailValid: this.validateEmail(userData.email, id),
      cpfValid: this.validateCpf(userData.cpf, id)
    }).pipe(
      switchMap((validations) => {
        if (!validations.emailValid) {
          return throwError(() => new Error('E-mail já cadastrado.'));
        }
        if (!validations.cpfValid) {
          return throwError(() => new Error('CPF já cadastrado.'));
        }
        return of(updatedUser).pipe(delay(500));
      }),
      switchMap((user) => {
        const currentUsers = this.usersSignal();
        const updatedUsers = currentUsers.map(u => u.id === id ? user : u);
        this.usersSignal.set(updatedUsers);
        this.usersSubject.next(updatedUsers);
        this.loadingSignal.set(false);
        return of(user);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Falha ao atualizar usuário.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida se o email já existe (exceto para o próprio usuário em edição)
   */
  private validateEmail(email: string, excludeId?: number): Observable<boolean> {
    return of(this.usersSignal()).pipe(
      delay(100),
      map((users) => {
        const existing = users.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeId
        );
        return !existing;
      })
    );
  }

  /**
   * Valida se o CPF já existe (exceto para o próprio usuário em edição)
   */
  private validateCpf(cpf: string, excludeId?: number): Observable<boolean> {
    return of(this.usersSignal()).pipe(
      delay(100),
      map((users) => {
        const cleanCpf = cpf.replace(/\D/g, '');
        const existing = users.find(u => 
          u.cpf.replace(/\D/g, '') === cleanCpf && u.id !== excludeId
        );
        return !existing;
      })
    );
  }

  /**
   * Deleta um usuário
   */
  deleteUser(id: number): Observable<boolean> {
    this.loadingSignal.set(true);

    return of(true).pipe(
      delay(300),
      switchMap(() => {
        const currentUsers = this.usersSignal();
        const updatedUsers = currentUsers.filter(u => u.id !== id);
        this.usersSignal.set(updatedUsers);
        this.usersSubject.next(updatedUsers);
        this.loadingSignal.set(false);
        return of(true);
      }),
      catchError(() => {
        this.loadingSignal.set(false);
        return throwError(() => new Error('Falha ao deletar usuário.'));
      })
    );
  }
}
