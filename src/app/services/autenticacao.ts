import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as Crypto from 'crypto-js';
import { Usuario, tipoUsuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class Autenticacao {
  //chave para salvar dados no ""banco""
  private readonly CHAVE_USUARIOS = "usuarios_salvos";
  private readonly CHAVE_USUARIO_LOGADO = "usuario_logado";
  //chave usada para criptgrafar senhas
  private readonly CHAVE_CRIPTOGRAFIA = "chave-secreta-calentec";

  constructor(private storage: Storage) { this.storage.create(); }

  //cadastrar usuário novo
  async cadastrar(usuario: Omit<Usuario, 'id'>): Promise<boolean>{
    try {
      //recebe todos os usuários salvos
      const usuarios = await this.getUsuarios();

      if(usuarios.find(u => u.email === usuario.email)) throw new Error("E-mail cadastrado anteriormente!");

      //valida usuário no caso de ser funcionário/aluno
      if(usuario.tipoUsuario !== tipoUsuario.RESPONSAVEL) {
        //valida se o código foi enviado
        if(!usuario.codigo) throw new Error("Código não enviado!");

        // verifica se o código já foi enviado anteriormente
        if(usuarios.find(u => u.codigo === usuario.codigo)) throw new Error("usuário salvo anteriormente!");
      }

      //constroi os dados do usuário
      const novoUsuario: Usuario = {
        ...usuario,
        id: Date.now().toString(),
        senha: this.cripografarSenha(usuario.senha),
      }

      //adiciona o novo usuário entre os usuários já salvos
      usuarios?.push(novoUsuario);

      //salva o novo array de usuários e 
      await this.storage.set(this.CHAVE_USUARIOS, usuarios);
      await this.storage.set(this.CHAVE_USUARIO_LOGADO, usuario);
      return true;
    } catch(erro){
      console.error(`Erro no cadastro ${erro}`);
      return false;
    }
  }

  //função de login
  async login(email: string, senha: string): Promise<Usuario | null>{
    //recebe os usuários salvos no storage
    const usuarios = this.getUsuarios();
    
    //recebe o usuário com o e-mail inserido
    const usuarioEscolhido = (await usuarios).find(u => u.email === email);

    //caso a senha esteja correta, o usuário fica logad
    if(usuarioEscolhido && this.verificarSenha(senha, usuarioEscolhido?.senha)) {
      await this.storage.set(this.CHAVE_USUARIO_LOGADO, usuarioEscolhido);
      return usuarioEscolhido;
    }
    return null;
  }

  //função de logout
  async logout(): Promise<void>{
    await this.storage.remove(this.CHAVE_USUARIO_LOGADO);
  }

  //criptografar senha
  private cripografarSenha(senha: string): string{
    return Crypto.AES.encrypt(senha, this.CHAVE_CRIPTOGRAFIA).toString();
  }

  //checa se a senha inserida está correta
  verificarSenha(senhaDigitada: string, senhaCriptografada: string): boolean {
    //descriptografa a senha salva anteriormente
    const bytes = CryptoJS.AES.decrypt(senhaCriptografada, this.CHAVE_CRIPTOGRAFIA);
    const senhaOriginal = bytes.toString(Crypto.enc.Utf8);

    return senhaDigitada === senhaOriginal;
  }

  //obtém os usuários
  private async getUsuarioAtual(): Promise<Usuario | null>{
    return await this.storage.get(this.CHAVE_USUARIO_LOGADO);
  }
  private async getUsuarios(): Promise<Usuario[]>{
    return await this.storage.get(this.CHAVE_USUARIOS) || [];
  }
}