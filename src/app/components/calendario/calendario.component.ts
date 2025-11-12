// src/app/components/calendario/calendario.component.ts

import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import { AlertController } from '@ionic/angular';
import { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventApi } from '@fullcalendar/core';

// 1. IMPORTAR FULLCALENDARCOMPONENT E VIEWCHILD
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventoCalendario } from 'src/app/models/EventoCalendario';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent  implements OnInit {
  //recebe a data inicial do mês e o tipo de usuário
  @Input() dataInicial: Date = new Date();
  @Input() tipoUsuario: string | undefined | null;
  // recebe a lista de eventos salvos através do menu
  @Input() eventos: EventoCalendario[] = [];

  // emite os eventos que ocorrerem
  @Output() eventoAdicionado = new EventEmitter<EventoCalendario>();
  @Output() eventoAtualizado = new EventEmitter<EventoCalendario>();
  @Output() eventoRemovido = new EventEmitter<string>(); // Emite o ID

  // recebe o componente do fullcalendar
  @ViewChild('calendario') componenteCalendario!: FullCalendarComponent

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: ptBrLocale,
    headerToolbar: { left: '', center: 'title', right: '' },
    navLinks: false,
    selectable: false,
    editable: false,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: false 
    },
    displayEventTime: true,
    events: [] // Será preenchido pelo Input
  };

  constructor(private alertController: AlertController) { }

  ngOnInit() {
    this.calendarOptions.initialDate = this.dataInicial;
    
    // insere os eventos do input no calendário
    this.calendarOptions.events = this.eventos;

    if (this.tipoUsuario === 'funcionário') {
      this.calendarOptions.selectable = true;
      this.calendarOptions.editable = true;
      this.calendarOptions.dateClick = this.handleDateClick.bind(this);
      this.calendarOptions.eventClick = this.handleEventClick.bind(this);
    }
  }

  // emite o evento pro componente pai
  async handleDateClick(arg: DateClickArg) {
    const alert = await this.alertController.create({
      header: 'Novo Evento',
      inputs: [
        { name: 'titulo', type: 'text', placeholder: 'Nome do evento' },
        { name: 'horario', type: 'time', placeholder: 'HH:mm' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.titulo && data.horario) {
              const dataISO = `${arg.dateStr}T${data.horario}:00`;

              const novoEvento: EventoCalendario = {
                id: Date.now().toString(),
                title: data.titulo,
                start: dataISO,
                allDay: false
              };

              // Adiciona na UI local
              arg.view.calendar.addEvent(novoEvento);
              
              // emite o evento para o componente pai salvar
              this.eventoAdicionado.emit(novoEvento);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // emite o evento de atualização pro componente pai
  async editarEvento(event: EventApi) {
    const horaAtual = new Date().toString().split(' ')[0].substring(0, 5);

    const alert = await this.alertController.create({
      header: 'Editar Evento',
      inputs: [
        { name: 'titulo', type: 'text', value: event.title },
        { name: 'horario', type: 'time', value: horaAtual }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.titulo && data.horario) {
              const dataOriginal = event.startStr.split('T')[0];
              const novoStartISO = `${dataOriginal}T${data.horario}:00`;

              // Atualiza na UI local
              event.setProp('title', data.titulo);
              event.setStart(novoStartISO);
              event.setProp('allDay', false);
              
              // emitindo o evento de atualização
              const eventoAtualizado: EventoCalendario = {
                id: event.id,
                title: data.titulo,
                start: novoStartISO,
                allDay: false
              };
              this.eventoAtualizado.emit(eventoAtualizado);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // emite o id que deve ser removido
  async confirmarRemocao(event: EventApi) {
    const alert = await this.alertController.create({
      header: 'Confirmar Remoção',
      message: 'Tem certeza que quer remover este evento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          handler: () => {
            const idParaRemover = event.id;
            event.remove(); // Remove da UI local

            // emite o id aqui
            this.eventoRemovido.emit(idParaRemover);
          }
        }
      ]
    });
    await alert.present();
  }

  // pergunta para o usuário o que ele quer fazer com o calendário
  async handleEventClick(arg: EventClickArg) {
    const alert = await this.alertController.create({
      header: 'O que deseja fazer?',
      message: `Evento: ${arg.event.title}`,
      buttons: [
        { text: 'Remover', role: 'destructive', handler: () => this.confirmarRemocao(arg.event) },
        { text: 'Editar', handler: () => this.editarEvento(arg.event) },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await alert.present();
  }
}