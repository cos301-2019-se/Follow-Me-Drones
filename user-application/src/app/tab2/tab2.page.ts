import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddNewDronePage } from './add-new-drone/add-new-drone.page';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  constructor(public modalcontroller: ModalController) {

  }
  async addNewDrone() {
    const modal = await this.modalcontroller.create( {
      component:  AddNewDronePage
    });
    await modal.present();
  }
}
