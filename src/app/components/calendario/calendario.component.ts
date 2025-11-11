import { Component, Input, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent  implements OnInit {
  //recebe o mês que deve ser exibido
  @Input() dataInicial: Date = new Date();

  // definindo as opções do calendário
   calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
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

  constructor() { }

  ngOnInit() {
    //inicia o calendário com a data inicial inserida
    this.calendarOptions.initialDate = this.dataInicial;
  }

}
