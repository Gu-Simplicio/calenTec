import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { Autenticacao } from 'src/app/services/autenticacao';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  usuario!: Usuario | null

  constructor( private autenticacao: Autenticacao ) { }

  async ngOnInit() {
    this.usuario = await this.autenticacao.getUsuarioAtual();

    console.log(this.usuario)
  }

}
