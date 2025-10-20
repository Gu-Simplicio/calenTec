import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarioComponent } from './calendario.component';

@NgModule({
  imports: [
    CommonModule,
    FullCalendarModule // ← Importado aqui
  ],
  declarations: [CalendarioComponent],
  exports: [CalendarioComponent] // ← Importante exportar
})
export class CalendarioComponentModule { }