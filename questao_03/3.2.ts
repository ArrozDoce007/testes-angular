// todo.model.ts

export interface Todo {
  id: number;
  titulo: string;
  concluido: boolean;
}

// todo.actions.ts

import { createAction, props } from '@ngrx/store';

export const loadTodos = createAction(
  '[Todo] Load Todos'
);

export const loadTodosSuccess = createAction(
  '[Todo] Load Todos Success',
  props<{ todos: Todo[] }>()
);

export const loadTodosError = createAction(
  '[Todo] Load Todos Error',
  props<{ error: string }>()
);

export const toggleTodoComplete = createAction(
  '[Todo] Toggle Todo Complete',
  props<{ id: number }>()
);

// todo.state.ts

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null
};

// todo.reducer.ts

import { createReducer, on } from '@ngrx/store';

export const todoReducer = createReducer(

  initialState,

  on(loadTodos, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadTodosSuccess, (state, { todos }) => ({
    ...state,
    todos,
    loading: false
  })),

  on(loadTodosError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(toggleTodoComplete, (state, { id }) => ({
    ...state,
    todos: state.todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            concluido: !todo.concluido
          }
        : todo
    )
  }))
);

// todo.selectors.ts

import {
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

export const selectTodoState =
  createFeatureSelector<TodoState>('todos');

export const selectAllTodos = createSelector(
  selectTodoState,
  (state) => state.todos
);

export const selectPendingTodos = createSelector(
  selectAllTodos,
  (todos) => todos.filter(todo => !todo.concluido)
);

export const selectLoading = createSelector(
  selectTodoState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectTodoState,
  (state) => state.error
);

// todo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(
    private readonly http: HttpClient
  ) {}

  buscarTodos(): Observable<Todo[]> {

    return this.http.get<Todo[]>(
      'https://api.fake.com/todos'
    );
  }
}

// todo.effects.ts

import { Injectable } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType
} from '@ngrx/effects';

import {
  catchError,
  map,
  mergeMap,
  of
} from 'rxjs';

@Injectable()
export class TodoEffects {

  loadTodos$ = createEffect(() =>

    this.actions$.pipe(

      ofType(loadTodos),

      mergeMap(() =>

        this.todoService.buscarTodos().pipe(

          map((todos) =>
            loadTodosSuccess({ todos })
          ),

          catchError((error) =>
            of(
              loadTodosError({
                error: error.message
              })
            )
          )
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly todoService: TodoService
  ) {}
}

// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  imports: [

    BrowserModule,

    HttpClientModule,

    StoreModule.forRoot({
      todos: todoReducer
    }),

    EffectsModule.forRoot([
      TodoEffects
    ])
  ]
})
export class AppModule {}