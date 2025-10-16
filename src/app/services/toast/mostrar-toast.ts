import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MostrarToast {
  constructor( private toastControler: ToastController ){ }

  async exibir(msg: string): Promise<void>{
    const toast = await this.toastControler.create({
      message: msg,
      duration: 3500,
      position: 'middle'
    });

    await toast.present();
  }
}
