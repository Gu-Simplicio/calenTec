import { Component, OnInit } from '@angular/core';
import { EventoCalendario } from 'src/app/models/EventoCalendario';
import { Usuario } from 'src/app/models/usuario';
import { Autenticacao } from 'src/app/services/auth/autenticacao';
import { Eventos } from 'src/app/services/eventos/eventos';

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

  //array com todos os eventos
  todosOsEventos: EventoCalendario[] = [];

  constructor( 
    private autenticacao: Autenticacao,
    private eventosService: Eventos
  ) { }

  async ngOnInit() {
    this.usuario = await this.autenticacao.getUsuarioAtual();

    this.gerarMeses(); //gera os 12 meses do ano
    this.carregarEventos(); //carrega os eventos do storage
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

  // carrega os eventos do storage para o array local
  async carregarEventos(){
    this.todosOsEventos = await this.eventosService.getEventos();
  }

  // salva o array local de volta pro storage
  private async salvarEventosNoStorage(){
    await this.eventosService.salvarEventos(this.todosOsEventos);
  }
  
  // chamado quando o calendário emite 'eventoAdicionado'
  async onEventoAdicionado(evento: EventoCalendario){
    this.todosOsEventos.push(evento);
    await this.salvarEventosNoStorage();
  }

  // chamado quando o calendário emite 'eventoAtualizado
  async onEventoAtualizado(evento: EventoCalendario){
    // pega o index do evento
    const index = this.todosOsEventos.findIndex( e => e.id === evento.id);

    // caso o index exista, atualiza o evento correspondente
    if( index > -1 ){
      this.todosOsEventos[index] = evento;
      await this.salvarEventosNoStorage();
    }
  }

  // chamado quando o calendário emiter 'eventoRemovido'
  async onEventoRemovido(id: string){
    //filtra os eventos, removendo o evento do id correspondente
    this.todosOsEventos = this.todosOsEventos.filter(e => e.id !== id);

    await this.salvarEventosNoStorage();
  }
}
