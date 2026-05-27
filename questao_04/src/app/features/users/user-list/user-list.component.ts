import { Component, inject, OnInit, DestroyRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TemplateRef, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { UserCardComponent } from '../user-card/user-card.component';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    UserCardComponent
  ],
  template: `
    <div class="user-list-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1 class="title">Gerenciamento de Usuários</h1>
          <p class="subtitle">Gerencie os usuários cadastrados</p>
        </div>
        <button 
          mat-fab 
          extended 
          class="add-button"
          (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Novo Usuário
        </button>
      </header>

      <!-- Search Section -->
      <section class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar por nome</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input 
            matInput 
            [formControl]="searchControl" 
            placeholder="Digite o nome do usuário..."
            autocomplete="off">
          @if (searchControl.value) {
            <button matSuffix mat-icon-button (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <div class="search-info">
          @if (isSearching()) {
            <span class="searching">Buscando...</span>
          } @else {
            <span class="count">{{ filteredUsers().length }} usuário(s) encontrado(s)</span>
          }
        </div>
      </section>

      <!-- Content -->
      <section class="content">
        @if (userService.loading()) {
          <div class="loading-container">
            <mat-spinner diameter="48"></mat-spinner>
            <p>Carregando usuários...</p>
          </div>
        } @else if (userService.error()) {
          <div class="error-container">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h3>Ops! Algo deu errado</h3>
            <p>{{ userService.error() }}</p>
            <button mat-raised-button color="primary" (click)="retry()">
              <mat-icon>refresh</mat-icon>
              Tentar novamente
            </button>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="empty-container">
            <mat-icon class="empty-icon">person_search</mat-icon>
            @if (searchControl.value) {
              <h3>Nenhum usuário encontrado</h3>
              <p>Não encontramos usuários com o nome "{{ searchControl.value }}"</p>
              <button mat-stroked-button color="primary" (click)="clearSearch()">
                Limpar busca
              </button>
            } @else {
              <h3>Nenhum usuário cadastrado</h3>
              <p>Comece adicionando o primeiro usuário</p>
              <button mat-raised-button color="primary" (click)="openCreateDialog()">
                <mat-icon>add</mat-icon>
                Adicionar usuário
              </button>
            }
          </div>
        } @else {
          <div class="users-grid">
            @for (user of filteredUsers(); track user.id) {
              <app-user-card 
                [user]="user" 
                (edit)="openEditDialog($event)"
                (delete)="deleteUser($event)">
              </app-user-card>
            }
          </div>
        }
      </section>
    </div>
    <ng-template #deleteDialog>
      <div class="delete-modal">

        <h2 mat-dialog-title class="dialog-title">
          Confirmar Exclusão
        </h2>

        <mat-dialog-content class="dialog-content">
          Deseja realmente excluir o usuário?<br>
          <strong>{{ selectedUser?.nome }}</strong>
        </mat-dialog-content>

        <mat-dialog-actions class="dialog-actions">

          <button
            mat-raised-button
            color="primary"
            [mat-dialog-close]="false">
            Cancelar
          </button>

          <button
            mat-raised-button
            color="warn"
            [mat-dialog-close]="true">
            Confirmar
          </button>

        </mat-dialog-actions>

      </div>
    </ng-template>
  `,
  styles: [`
    .user-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .header-content {
      flex: 1;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .add-button {
      background-color: var(--accent-color) !important;
      color: white !important;

      &:hover {
        background-color: var(--accent-dark) !important;
      }
    }

    .search-section {
      margin-bottom: 24px;
    }

    .search-field {
      width: 100%;
      max-width: 100%;
    }

    .search-info {
      margin-top: 8px;
      font-size: 0.875rem;
    }

    .searching {
      color: var(--primary-color);
      font-style: italic;
    }

    .count {
      color: var(--text-secondary);
    }

    .content {
      min-height: 400px;
    }

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 24px;
      gap: 16px;
    }

    .loading-container p,
    .error-container p,
    .empty-container p {
      color: var(--text-secondary);
      margin: 0;
    }

    .error-container h3,
    .empty-container h3 {
      margin: 0;
      color: var(--text-primary);
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--accent-color);
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--text-secondary);
      opacity: 0.5;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    
    .delete-modal {
    padding: 10px 24px 20px;
    }

    .dialog-title {
      text-align: center;
      margin-bottom: 10px;
    }

    .dialog-content {
      text-align: center;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 0;
    }

    .dialog-actions button {
      min-width: 120px;
    }

    .dialog-actions button[color="warn"] {
      background-color: #d32f2f !important;
      color: white !important;
    }
  `]
})
export class UserListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  userService = inject(UserService);

  searchControl = new FormControl('');

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

  selectedUser!: User;

  // Signals para estado local
  private filteredUsersSignal = signal<User[]>([]);
  private isSearchingSignal = signal<boolean>(false);

  // Computed para expor o estado
  filteredUsers = computed(() => this.filteredUsersSignal());
  isSearching = computed(() => this.isSearchingSignal());

  ngOnInit(): void {
    this.setupSearch();
  }

  /**
   * Configura o filtro de busca com debounce de 300ms
   * Operadores RxJS utilizados: debounceTime, distinctUntilChanged, switchMap, startWith, catchError
   */
  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Debounce de 300ms conforme requisito
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isSearchingSignal.set(true);
        return this.userService.filterUsersByName(searchTerm || '').pipe(
          catchError(() => {
            this.snackBar.open('Erro ao filtrar usuários', 'Fechar', { duration: 3000 });
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef) // Gerenciamento automático de subscription
    ).subscribe((users) => {
      this.filteredUsersSignal.set(users);
      this.isSearchingSignal.set(false);
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  retry(): void {
    this.userService.loadUsers();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('Usuário criado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        }
      });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true,
      data: { mode: 'edit', user }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        }
      });
  }

  deleteUser(user: User): void {
    this.selectedUser = user;

    const dialogRef = this.dialog.open(this.deleteDialog, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open(
                'Usuário excluído com sucesso!',
                'Fechar',
                { duration: 3000 }
              );
            },
            error: () => {
              this.snackBar.open(
                'Erro ao excluir usuário',
                'Fechar',
                { duration: 3000 }
              );
            }
          });
      }
    });
  }
}