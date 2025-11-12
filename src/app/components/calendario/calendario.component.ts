import { Component, Input, OnInit } from '@angular/core';
import { CalendarOptions, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { AlertController } from '@ionic/angular';

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

    events: [
      { title: "Evento de teste", date: new Date() }
    ]
  };

  constructor( private alertController: AlertController ) { }

  ngOnInit() {
    //inicia o calendário com a data inicial inserida
    this.calendarOptions.initialDate = this.dataInicial;

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
        {
          name: 'titulo',
          type: 'text',
          placeholder: 'Nome do evento',
        }
      ],
      buttons: [ //botões de salvar e cancelar
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: (data) => { //botão de salvar cria o evento 
            if(data.titulo){
              arg.view.calendar.addEvent({
                title: data.titulo,
                start: arg.dateStr,
                allDay: true
              });
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
          handler: () => {
            event.remove(); //remove o evento da UI
          }
        }
      ]
    });

    await alert.present();
  }


  // UPDATE do calendário
  async editarEvento(event: EventApi){
    const alert = await this.alertController.create({
      header: "Editar evento",
      inputs: [ // dá a opção de editar os dados inseridos
        {
          name: 'titulo',
          type: 'text',
          value: event.title, //já vem com o título atual
          placeholder: 'Novo nome do evento'
        }
      ],
      buttons: [ // botões de ação
        { // CANCELA A AÇÃO
          text: 'Cancelar',
          role: 'cancel'
        },
        { // SALVA A EDIÇÃO
          text: 'Salvar',
          handler: (data) => {
            if(data.titulo) { 
              event.setProp('title', data.titulo);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
