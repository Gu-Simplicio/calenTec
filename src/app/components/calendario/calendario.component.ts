import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { AlertController } from '@ionic/angular';
import { Eventos } from 'src/app/services/eventos/eventos';
import { EventoCalendario } from 'src/app/models/EventoCalendario';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent  implements OnInit {
  //recebe o mês que deve ser exibido
  @Input() dataInicial: Date = new Date();
  //recebe se o usuário é um funcionário ou não
  @Input() ehFuncionario: boolean | undefined | null;
  // recebe o componente do calendário
  @ViewChild('calendario') componenteCalendario!: FullCalendarComponent;

  // definindo as opções do calendário
   calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: ptBrLocale,
    // opções para travar o calendário
    headerToolbar: { //remove botões 'prev', 'next' e 'today'
      left: '',
      center: 'title', //mantém o título
      right: ''
    },
    //impede de editar e clicar nos dias e eventos
    navLinks: false,
    selectable: false,
    editable: false,

    eventTimeFormat: { //indicando para exibir horário 
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: false
    },
    displayEventTime: true, // garante que o horário seja exibido
    events: [] // inicia os eventos sem nada
  };

  constructor( 
    private eventosService: Eventos,
    private alertController: AlertController
   ) { }

  async ngOnInit() {
    //inicia o calendário com a data inicial inserida
    this.calendarOptions.initialDate = this.dataInicial;

    // carrega os eventos salvos no Storage
    this.calendarOptions.events = await this.eventosService.getEventos();

    //no caso de ser funcionário
    if(this.ehFuncionario === true){
      //transforma o calendário em editável.
      this.calendarOptions.selectable = true;
      this.calendarOptions.editable = true;

      //o bind() serve pro this das funções se referir ao componente
      this.calendarOptions.dateClick = this.handleDateClick.bind(this);
      this.calendarOptions.eventClick = this.handleEventClick.bind(this)
    }
  }

  //chamado quando clicar num dia do calendário
  async handleDateClick(arg: DateClickArg): Promise<void>{
    const alert = await this.alertController.create({
      header: "Novo evento",
      message: `Criar evento para ${arg.dateStr}`,
      inputs: [ //cria um input pro evento 
        { //input de título do evento
          name: 'titulo',
          type: 'text',
          placeholder: 'Nome do evento',
        },
        { //input de horário do evento
          name: 'horario',
          type: 'time', // input de horário
          placeholder: "HH:mm"
        }
      ],
      buttons: [ //botões de salvar e cancelar
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: async (data) => { //botão de salvar cria o evento 
            if(data.titulo && data.horario){
              // constrói a maneira ISO da data
              const dataISO = `${arg.dateStr}T${data.horario}:00`;

              const novoEvento: EventoCalendario = {
                id: Date.now().toString(), //gera um id baseado no momento em que o evento foi criado
                title: data.titulo,
                start: dataISO,
                allDay: false // diz que o evento não necessariamente dura o dia todo
              }

              //salva o evento na UI
              arg.view.calendar.addEvent(novoEvento);

              // salva o evento no Storage
              await this.salvarTodosEventosDaUI(arg.view.calendar);
            }
          }
        }
      ]
    });

    //exibe o alertController
    await alert.present();
  }

  // chama quando clica num evento que já existe
  async handleEventClick(arg: EventClickArg){
    const alert = await this.alertController.create({
      header: 'O que deseja fazer?',
      message: `Evento ${arg.event.title}`,

      buttons: [ //botões de ação
        { // REMOVE O EVENTO
          text: 'Remover',
          role: 'destructive', //deixa o botão vermelho
          handler: () => this.confirmarRemocao(arg.event)
        },
        { // EDITA O EVENTO
          text: 'Editar',
          handler: () => this.editarEvento(arg.event)
        },
        { // CANCELA A AÇÃO
          text: "Cancelar",
          role: 'cancel'
        }
      ],
    });

    await alert.present();
  }

  // DELETE do crud
  async confirmarRemocao(event: EventApi){
    const alert = await this.alertController.create({
      header: 'Confirmar remoção',
      message: 'Tem certeza que quer remover este evento?',
      buttons: [ //botões de ação
        { // CANCELA A REMOÇÃO  
          text: 'Cancelar',
          role: 'cancel'
        },
        { // CONFIRMA A AÇÃO
          text: 'Remover',
          handler: async () => {
            event.remove(); //remove o evento da UI

            // salva no storage
            await this.salvarTodosEventosDaUI(this.componenteCalendario.getApi());
          }
        }
      ]
    });

    await alert.present();
  }


  // UPDATE do calendário
  async editarEvento(event: EventApi){
    //formatar a hora autal do evento
    // (ex.: de "2025-10-10T09:00:00" vai para "09:00")
    const horaAtual = event.start?.toTimeString().split(' ')[0].substring(0, 5)

    const alert = await this.alertController.create({
      header: "Editar evento",
      inputs: [ // dá a opção de editar os dados inseridos
        { // input do título
          name: 'titulo',
          type: 'text',
          value: event.title, //já vem com o título atual
          placeholder: 'Novo nome do evento'
        },
        {
          name: 'horario',
          type: 'time',
          value: horaAtual
        }
      ],
      buttons: [ // botões de ação
        { // CANCELA A AÇÃO
          text: 'Cancelar',
          role: 'cancel'
        },
        { // SALVA A EDIÇÃO
          text: 'Salvar',
          handler: async (data) => {
            if(data.titulo && data.horario) { 
              // pega a data original sem o horário
              const dataOriginal = event.startStr.split('T')[0];
              //cria a data com horário atualizado
              const novoStartISO = `${dataOriginal}T${data.horario}:00`;

              //atualiza a UI
              event.setProp('title', data.titulo); //atualiza título
              event.setStart(novoStartISO); //atualiza data/hora
              event.setProp('allDay', false); // diz que não dura o dia todo

              // salva no storage
              await this.salvarTodosEventosDaUI(this.componenteCalendario.getApi());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // método para salvar todos os eventos da UI no storage
  private async salvarTodosEventosDaUI(calendarAPI: any){
    // pega todos os eventos que estão no calendário
    const eventosAtuais = calendarAPI.getEvents();

    //converte para o formato PlainObject (pra poder ser salvo com JSON) e mapeia a interface eventoCalendario
    const eventosParaSalvar: EventoCalendario[] = eventosAtuais.map((e: EventApi) => ({
      id: e.id || new Date().toString(), //garante um id
      title: e.title,
      start: e.startStr,
      allDay: e.allDay
    }));

    // salva a lista completa com o service
    await this.eventosService.salvarEventos(eventosParaSalvar);
  }
}
