import { Component, OnInit } from '@angular/core';
import { Autenticacao } from 'src/app/services/autenticacao';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private autenticacao: Autenticacao
  ) { }

  ngOnInit() {
  }

}
