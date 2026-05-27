import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="user-card">
      <div class="card-header">
        <div class="avatar">
          {{ getInitials() }}
        </div>
        <div class="user-info">
          <h3 class="name">{{ user.nome }}</h3>
          <p class="email">{{ user.email }}</p>
        </div>
      </div>
      
      <div class="card-body">
        <div class="info-row">
          <mat-icon class="info-icon">badge</mat-icon>
          <span class="info-label">CPF:</span>
          <span class="info-value">{{ user.cpf }}</span>
        </div>
        <div class="info-row">
          <mat-icon class="info-icon">phone</mat-icon>
          <span class="info-label">{{ getTipoTelefoneLabel() }}:</span>
          <span class="info-value">{{ user.telefone }}</span>
        </div>
      </div>

      <div class="card-actions">
        <button 
          mat-stroked-button 
          color="primary"
          matTooltip="Editar usuário"
          (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Editar
        </button>
        <button 
          mat-icon-button 
          color="warn"
          matTooltip="Excluir usuário"
          (click)="onDelete()">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-card {
      background: var(--card-background);
      border-radius: 12px;
      box-shadow: var(--shadow);
      padding: 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
    }

    .info-label {
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .info-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class UserCardComponent {
  @Input({ required: true }) user!: User;
  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();

  getInitials(): string {
    const names = this.user.nome.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  getTipoTelefoneLabel(): string {
    const labels: Record<string, string> = {
      'celular': 'Celular',
      'residencial': 'Residencial',
      'comercial': 'Comercial'
    };
    return labels[this.user.tipoTelefone] || 'Telefone';
  }

  onEdit(): void {
    this.edit.emit(this.user);
  }

  onDelete(): void {
    this.delete.emit(this.user);
  }
}
