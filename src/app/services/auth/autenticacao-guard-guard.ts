import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Autenticacao } from './autenticacao';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoGuard implements CanActivate {

  constructor(
    private autenticacao: Autenticacao,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const usuarioLogado = await this.autenticacao.getUsuarioAtual();

    if (usuarioLogado) {
      // Usuário está logado, permite o acesso
      return true;
    } else {
      // Usuário não está logado, redireciona para o login
      this.router.navigate(['/login']);
      return false;
    }
  }
}