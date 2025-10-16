import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Autenticacao } from 'src/app/services/auth/autenticacao';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  //recebe o formulario de login
  @ViewChild('formularioLogin') formularioLogin!: NgForm;
  //prepara o objeto do usuário
  usuario = { 
    email: '',
    senha: ''
  }

  constructor(
    private autenticacao: Autenticacao,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async entrar(){
    if(!this.formularioLogin.valid) throw new Error("Formulário inválido!!");

    try {
      const usuarioLogado = await this.autenticacao.login(this.usuario.email, this.usuario.senha)

      //caso o usuário tenha sido logado corretamente
      if(usuarioLogado){
        this.router.navigate(['/menu']);
      } else {
        throw new Error("Erro ao entrar");
      }
    }catch(erro){
      console.log(erro)
    }
  }
}
