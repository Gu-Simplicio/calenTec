export interface EventoCalendario{
    id: string,
    title: string,
    start: string, // data e hora no formato ISO (ex: 2025-10-20T09:00:00)   
    allDay: boolean // salva se o evento dura o dia todos
}