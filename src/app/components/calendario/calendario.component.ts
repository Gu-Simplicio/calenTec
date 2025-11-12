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
  //recebe a data inicial do mês
  @Input() dataInicial: Date = new Date();
  //recebe se o usuário é funcionário ou não
  @Input() ehFuncionario: boolean | undefined | null;
  // recebe a lista de eventos pelo componente pai
  @Input() eventos: EventoCalendario[] = [];

  // emissores de eventos
  @Output() eventoAdicionado = new EventEmitter<EventoCalendario>();
  @Output() eventoAtualizado = new EventEmitter<EventoCalendario>();
  @Output() eventoRemovido = new EventEmitter<string>(); // Emite o ID

  // recebe o componente do fullcalendar
  @ViewChild('calendario') componenteCalendario!: FullCalendarComponent;

  // nome do mês exibido
  nomeDoMes: string = '';

  //configura as opções do calendário
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: ptBrLocale,
    headerToolbar: { left: '', center: '', right: '' },
    dayHeaderFormat: { weekday: 'narrow' },
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

  constructor(private alertController: AlertController) { }

  ngOnInit() {
    // seta a data inicial
    this.calendarOptions.initialDate = this.dataInicial;

    //salva o nome do mês
    this.nomeDoMes = this.dataInicial.toLocaleDateString('pt-Br', { month: 'long' })

    // caso seja um funcionário, atualiza os dados do calendário para um CRUD
    if (this.ehFuncionario === true) {
      this.calendarOptions.selectable = true;
      this.calendarOptions.editable = true;
      this.calendarOptions.dateClick = this.handleDateClick.bind(this);
      this.calendarOptions.eventClick = this.handleEventClick.bind(this);
    } else { // caso seja um aluno, atualiza o calendário para exibir os dados do evento quando clicado
      this.calendarOptions.selectable = false; //não permite selecionar dias vagos
      this.calendarOptions.eventClick = this.handleEventClickAluno.bind(this);// permite clicar em um evento existente para exibir detalhes
    }
  }

  async handleEventClickAluno(arg: EventClickArg){
    // pega a hora do evento e formata (HH:mm)
    const horaEvento = arg.event.start
    ? arg.event.start.toTimeString().split(' ')[0].substring(0, 5) //caso tenha informado o horário
    : 'Horário não definido!' //caso não tenha

    const alert = await this.alertController.create({
      header: arg.event.title, // o título do evento fica na parte de cima do modal
      message: `Horário do evento: ${horaEvento}`,
      buttons: [
        {
          text: 'Fechar',
          role: 'cancel' //botão para fechar o modal
        }
      ]
    });

    await alert.present();
  }

  // função para criar um novo evento
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
            //caso os dados tenham sido inseridos
            if (data.titulo && data.horario) {
              // configura a data em formato ISO
              const dataISO = `${arg.dateStr}T${data.horario}:00`;

              //dados para um novo evento
              const novoEvento: EventoCalendario = {
                id: Date.now().toString(),
                title: data.titulo,
                start: dataISO,
                allDay: false
              };

              // Adiciona na UI local
              arg.view.calendar.addEvent(novoEvento);
              
              // emite o evento de adição
              this.eventoAdicionado.emit(novoEvento);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // função para editar o evento
  async editarEvento(event: EventApi) {
    // captura a hora atual, caso o event tenha hora de começo
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
            // caso os dados tenham sido inseridos
            if (data.titulo && data.horario) {
              // recebe a data original do evento
              const dataOriginal = event.startStr.split('T')[0];
              // configura o novo horário e data inicial
              const novoStartISO = `${dataOriginal}T${data.horario}:00`;

              // Atualiza na UI local
              event.setProp('title', data.titulo);
              event.setStart(novoStartISO);
              event.setProp('allDay', false);
              
              // evento atualizado pronto para ser enviado para o componente pai
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

  // função para remover o evento
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

            // emite o id que deve ser removido no storage
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
