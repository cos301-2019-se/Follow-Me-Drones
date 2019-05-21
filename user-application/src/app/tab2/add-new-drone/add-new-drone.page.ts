import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-add-new-drone',
  templateUrl: './add-new-drone.page.html',
  styleUrls: ['./add-new-drone.page.scss'],
})
export class AddNewDronePage implements OnInit {

  constructor( public alertcontroller: AlertController, public modalcontroller: ModalController ) { }

  ngOnInit() {

  }

  async submitDroneInfo() {
    // TODO: do error checking
    //
    let errorFree = true;

    if (errorFree) {
      const alert = await this.alertcontroller.create({
        header: 'Success',
        message: 'New drone added!',
        buttons: [
          {
            text: 'OK',
            cssClass: 'secondary',
            handler: () => {
              this.modalcontroller.dismiss();
            }
          }
        ]
      });

      await alert.present();

    } else {
      // TODO: errors in format of input

    }

  }
  async cancelDroneCreation() {
    const alert = await this.alertcontroller.create({
      header: 'Confirm!',
      message: 'Are you sure you want to cancel? <br> Your progress will be lost',
      buttons: [
        {
          text: 'No',
          cssClass: 'secondary',
          handler: () => {
            // close dialog
          }
        }, {
          text: 'Yes',
          handler: () => {
            // navigate back to drones list screen (close modal)
            this.modalcontroller.dismiss();

          }
        }
      ]
    });

    await alert.present();
  }




}
