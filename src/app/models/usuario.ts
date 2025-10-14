export enum tipoUsuario {
    FUNCIONARIO = "funcionário",
    RESPONSAVEL = "responsável",
    ALUNO = "aluno"
}

export interface Usuario {
    id: string;
    nome: string,
    senha: string,
    tipoUsuario: tipoUsuario,
    codigo?: string,
}