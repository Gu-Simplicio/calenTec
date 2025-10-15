import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario';
import { Autenticacao } from 'src/app/services/autenticacao';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuario!: Usuario | null;

  constructor(
    private autenticacao: Autenticacao,
    private router: Router
  ) { }

  async ngOnInit() {
    this.usuario = await this.autenticacao.getUsuarioAtual();
    console.log(this.usuario);
  }

  sair(){
    //desloga o usuário
    this.autenticacao.logout();
    //vai pro login
    this.router.navigate(['/login']);
  }
}
