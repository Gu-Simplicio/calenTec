import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { EventoCalendario } from 'src/app/models/EventoCalendario';

@Injectable({
  providedIn: 'root'
})
export class Eventos {
  //chave para ler os eventos salvos
  private readonly CHAVE_EVENTOS = "eventos_calentec";

  constructor( private storage: Storage ) {
    this.storage.create(); //garante que o storage está pronto
  }

  // retorna todos os eventos salvos
  async getEventos(): Promise<EventoCalendario[]>{
    const eventos = await this.storage.get(this.CHAVE_EVENTOS) || [];

    return eventos;
  }

  // salva a lista completa de eventos no storage
  async salvarEventos(eventos: EventoCalendario[]): Promise<any>{
    return this.storage.set(this.CHAVE_EVENTOS, eventos);
  }
}
