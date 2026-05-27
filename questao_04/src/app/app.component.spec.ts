import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('deve renderizar o container principal', async () => {
    await render(AppComponent);

    expect(document.querySelector('.app-container')).toBeTruthy();
  });

  it('deve conter router-outlet', async () => {
    await render(AppComponent);

    expect(document.querySelector('router-outlet')).toBeTruthy();
  });
});