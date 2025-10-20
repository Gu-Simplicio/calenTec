import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuPageRoutingModule } from './menu-routing.module';

import { MenuPage } from './menu.page';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { CalendarioComponentModule } from 'src/app/components/calendario/calendario.component.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuPageRoutingModule,
    FooterComponent,
    CalendarioComponentModule
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
