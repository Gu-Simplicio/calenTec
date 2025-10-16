import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [IonicModule]
})
export class FooterComponent  implements OnInit {
  @Input() funcLogado?: boolean;

  constructor() { }

  ngOnInit() {}

}
