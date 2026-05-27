import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { User, UserFormData, TipoTelefone } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

interface DialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-content">
        <!-- Nome -->
        <mat-form-field appearance="outline">
          <mat-label>Nome completo</mat-label>
          <input matInput formControlName="nome" placeholder="Digite o nome completo">
          <mat-icon matPrefix>person</mat-icon>
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>O nome é obrigatório</mat-error>
          }
          @if (form.get('nome')?.hasError('minlength') && form.get('nome')?.touched) {
            <mat-error>O nome deve ter pelo menos 3 caracteres</mat-error>
          }
        </mat-form-field>

        <!-- Email -->
        <mat-form-field appearance="outline">
          <mat-label>E-mail</mat-label>
          <input matInput formControlName="email" placeholder="exemplo@email.com" type="email">
          <mat-icon matPrefix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>O e-mail é obrigatório</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Digite um e-mail válido</mat-error>
          }
          @if (form.get('email')?.hasError('invalidEmail') && form.get('email')?.touched) {
            <mat-error>Formato de e-mail inválido</mat-error>
          }
        </mat-form-field>

        <!-- CPF -->
        <mat-form-field appearance="outline">
          <mat-label>CPF</mat-label>
          <input 
            matInput 
            formControlName="cpf" 
            placeholder="000.000.000-00"
            (input)="onCpfInput($event)"
            maxlength="14">
          <mat-icon matPrefix>badge</mat-icon>
          @if (form.get('cpf')?.hasError('required') && form.get('cpf')?.touched) {
            <mat-error>O CPF é obrigatório</mat-error>
          }
          @if (form.get('cpf')?.hasError('invalidCpf') && form.get('cpf')?.touched) {
            <mat-error>CPF inválido</mat-error>
          }
        </mat-form-field>

        <!-- Telefone -->
        <div class="phone-row">
          <mat-form-field appearance="outline" class="phone-type-field">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipoTelefone">
              @for (tipo of tiposTelefone; track tipo.value) {
                <mat-option [value]="tipo.value">{{ tipo.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="phone-field">
            <mat-label>Telefone</mat-label>
            <input 
              matInput 
              formControlName="telefone" 
              placeholder="(00) 00000-0000"
              (input)="onPhoneInput($event)"
              maxlength="15">
            <mat-icon matPrefix>phone</mat-icon>
            @if (form.get('telefone')?.hasError('required') && form.get('telefone')?.touched) {
              <mat-error>O telefone é obrigatório</mat-error>
            }
            @if (form.get('telefone')?.hasError('invalidPhone') && form.get('telefone')?.touched) {
              <mat-error>Telefone inválido</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button 
            mat-stroked-button 
            type="button" 
            (click)="onCancel()"
            [disabled]="isSubmitting">
            Cancelar
          </button>
          @if (isSubmitting) {
            <button 
              mat-raised-button 
              color="primary"
              type="button"
              disabled
              class="submit-button">
              <mat-spinner diameter="20"></mat-spinner>
              <span>Salvando...</span>
            </button>
          } @else {
            <button 
              mat-raised-button 
              color="primary"
              type="submit"
              [disabled]="form.invalid || form.pristine"
              class="submit-button">
              <mat-icon>save</mat-icon>
              <span>{{ isEditMode ? 'Atualizar' : 'Cadastrar' }}</span>
            </button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .close-button {
      margin: -8px -8px -8px 0;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 24px;
      overflow-y: auto;
    }

    mat-form-field {
      width: 100%;
    }

    .phone-row {
      display: flex;
      gap: 16px;
    }

    .phone-type-field {
      flex: 0 0 140px;
    }

    .phone-field {
      flex: 1;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      margin-top: 8px;
      border-top: 1px solid var(--border-color);
    }

    .submit-button {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-spinner {
        margin-right: 4px;
      }
    }

    @media (max-width: 480px) {
      .phone-row {
        flex-direction: column;
        gap: 8px;
      }

      .phone-type-field {
        flex: 1;
      }

      .dialog-actions {
        flex-direction: column-reverse;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private userService = inject(UserService);
  private data: DialogData = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isSubmitting = false;

  tiposTelefone = [
    { value: 'celular' as TipoTelefone, label: 'Celular' },
    { value: 'residencial' as TipoTelefone, label: 'Residencial' },
    { value: 'comercial' as TipoTelefone, label: 'Comercial' }
  ];

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initForm();
    
    if (this.isEditMode && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      telefone: ['', [Validators.required, this.phoneValidator]],
      tipoTelefone: ['celular' as TipoTelefone, Validators.required]
    });
  }

  private populateForm(user: User): void {
    this.form.patchValue({
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      telefone: user.telefone,
      tipoTelefone: user.tipoTelefone
    });
  }

  // Validador customizado para e-mail
  private emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  // Validador customizado para CPF
  private cpfValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const cpf = control.value.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
      return { invalidCpf: true };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return { invalidCpf: true };
    }

    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) {
      return { invalidCpf: true };
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) {
      return { invalidCpf: true };
    }

    return null;
  }

  // Validador customizado para telefone
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const phone = control.value.replace(/\D/g, '');
    
    // Telefone deve ter 10 ou 11 dígitos
    if (phone.length < 10 || phone.length > 11) {
      return { invalidPhone: true };
    }

    return null;
  }

  // Máscara de CPF
  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
    }

    this.form.get('cpf')?.setValue(value, { emitEvent: false });
  }

  // Máscara de telefone
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, '($1');
    }

    this.form.get('telefone')?.setValue(value, { emitEvent: false });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData: UserFormData = this.form.value;

    if (this.isEditMode && this.data.user) {
      this.userService.updateUser(this.data.user.id, formData).subscribe({
        next: (user) => {
          this.isSubmitting = false;
          this.dialogRef.close(user);
        },
        error: (error) => {
          this.isSubmitting = false;
          // Erro já tratado no serviço
        }
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: (user) => {
          this.isSubmitting = false;
          this.dialogRef.close(user);
        },
        error: (error) => {
          this.isSubmitting = false;
          // Erro já tratado no serviço
        }
      });
    }
  }
}
