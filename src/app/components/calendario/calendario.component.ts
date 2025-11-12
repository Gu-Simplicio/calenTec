import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { AlertController } from '@ionic/angular';
import { EventoCalendario } from 'src/app/models/EventoCalendario';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent  implements OnInit {
  @Input() dataInicial: Date = new Date();
  @Input() ehFuncionario: boolean | undefined | null;
  // 3. RECEBER A LISTA DE EVENTOS DO PAI
  @Input() eventos: EventoCalendario[] = [];

  // 4. EMITIR MUDANÇAS PARA O PAI
  @Output() eventoAdicionado = new EventEmitter<EventoCalendario>();
  @Output() eventoAtualizado = new EventEmitter<EventoCalendario>();
  @Output() eventoRemovido = new EventEmitter<string>(); // Emite o ID

  // 5. REFERÊNCIA AO CALENDÁRIO
  @ViewChild('calendario') componenteCalendario!: FullCalendarComponent;

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
    displayEventTime: true
  };

  // 6. REMOVER O EventosService DO CONSTRUTOR
  constructor(private alertController: AlertController) { }

  ngOnInit() {
    this.calendarOptions.initialDate = this.dataInicial;

    if (this.ehFuncionario === true) {
      this.calendarOptions.selectable = true;
      this.calendarOptions.editable = true;
      this.calendarOptions.dateClick = this.handleDateClick.bind(this);
      this.calendarOptions.eventClick = this.handleEventClick.bind(this);
    }
  }

  // --- LÓGICA DO CRUD (AGORA EMITINDO EVENTOS) ---

  /**
   * CREATE: Emite o evento para o pai
   */
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
              
              // 8. EMITIR O NOVO EVENTO PARA O PAI SALVAR
              this.eventoAdicionado.emit(novoEvento);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * UPDATE: Emite o evento atualizado para o pai
   */
  async editarEvento(event: EventApi) {
    const horaAtual = event.start ? event.start.toTimeString().split(' ')[0].substring(0, 5) : '00:00';

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
              
              // 9. EMITIR O EVENTO ATUALIZADO PARA O PAI
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

  /**
   * DELETE: Emite o ID do evento para o pai
   */
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

            // 10. EMITIR O ID PARA O PAI REMOVER DO STORAGE
            this.eventoRemovido.emit(idParaRemover);
          }
        }
      ]
    });
    await alert.present();
  }

  // A função handleEventClick não muda
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
