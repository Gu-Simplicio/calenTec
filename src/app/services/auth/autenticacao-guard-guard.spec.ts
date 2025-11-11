import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { autenticacaoGuardGuard } from './autenticacao-guard-guard';

describe('autenticacaoGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => autenticacaoGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
