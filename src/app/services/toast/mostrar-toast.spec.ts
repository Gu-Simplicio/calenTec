import { TestBed } from '@angular/core/testing';

import { MostrarToast } from './mostrar-toast';

describe('MostrarToast', () => {
  let service: MostrarToast;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MostrarToast);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
