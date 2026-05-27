import { Routes } from '@angular/router';
import { UserListComponent } from './features/users/user-list/user-list.component';

export const routes: Routes = [
  { path: '', component: UserListComponent },
  { path: '**', redirectTo: '' }
];
