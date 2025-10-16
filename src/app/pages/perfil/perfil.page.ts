import { Component, OnInit } from '@angular/core';[]
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
  ) { }

  async ngOnInit() { this.usuario = await this.autenticacao.getUsuarioAtual(); }

  async sair(){
    //desloga o usuário
    this.autenticacao.logout();
  }
}
