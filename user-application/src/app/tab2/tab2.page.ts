import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  constructor(public modalcontroller: ModalController,
              public router: Router) {

  }
  openPage(routename: string) {
    this.router.navigateByUrl(`/tabs/tab2/${routename}`);
  }
}
