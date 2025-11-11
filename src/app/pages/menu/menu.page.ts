import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { Autenticacao } from 'src/app/services/auth/autenticacao';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  usuario!: Usuario | null;

  //array que receberá os meses do ano
  mesesDoAno: Date[] = [];

  constructor( private autenticacao: Autenticacao ) {
    this.gerarMeses();
  }

  async ngOnInit() {
    this.usuario = await this.autenticacao.getUsuarioAtual();

    console.log(this.usuario)
  }

  gerarMeses(): void {
    const anoAtual = new Date().getFullYear();

    for(let i = 0; i < 12; i++){
      //cria uma data para o dia 1 de cada mês e insere no array
      const mesNovo = new Date(
        anoAtual,  // ano atual
        i,  // i = 0 é janeiro, i = 2 é fevereiro..
        1 //dia 1 do mês escolhido
      );

      this.mesesDoAno.push(mesNovo);
    }
  }

}
