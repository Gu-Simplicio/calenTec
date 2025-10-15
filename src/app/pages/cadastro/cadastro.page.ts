import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { tipoUsuario, Usuario } from 'src/app/models/usuario';
import { Autenticacao } from 'src/app/services/autenticacao';

@Component({
  selector: 'app-cadastro',
  standalone: false,
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  //recebe o formulário de cadastro
  @ViewChild('formularioCadastro') formularioCadastro!: NgForm;

  // salva os campos do usuário
  usuario: Usuario = {
    id: '',
    nome: '',
    email: '',
    senha: '',
    codigo: '',
    tipoUsuario: tipoUsuario.ALUNO
  }
  //variável responsável por exibir (ou não) o campo de RM/código
  mostrarCodigo!: boolean;

  constructor(
    private autenticacao: Autenticacao,
    private router: Router
  ) { 
    this.alteraTipo() 
  }

  ngOnInit() {
  }

  // exibe ou não o campo de código/Rm
  alteraTipo(): void{
    this.mostrarCodigo = this.usuario.tipoUsuario !== tipoUsuario.RESPONSAVEL;
  }

  async cadastrar(){
    //checa se o formulário é válido
    if(!this.formularioCadastro.valid) throw new Error("Formulário incompleto!")
    
    //realiza o cadastro do usuário
    const usuarioCadastrado = await this.autenticacao.cadastrar(this.usuario);

    if(usuarioCadastrado) {
      this.router.navigate(['/menu']);
    } else {
      throw new Error("Erro ao cadastrar usuário!");
    }
  }
}
