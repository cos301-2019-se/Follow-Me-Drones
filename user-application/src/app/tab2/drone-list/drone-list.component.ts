import { Component, AfterViewInit } from '@angular/core';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../../services/drone-socket/drone-socket.service';
import { Observable, Subject } from 'rxjs/Rx';
import { ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { FlightSessionComponent } from '../flight-session/flight-session.component';
@Component({
  selector: 'app-drone-list',
  templateUrl: './drone-list.component.html',
  styleUrls: ['./drone-list.component.scss'],
})
export class DroneListComponent implements AfterViewInit {

  private droneList: DroneData[] = [];
  isValid: boolean;
  messages: Subject<any>;
  count = 0;
	constructor( private droneSock: DroneSocketService, 
		public toastController: ToastController, 
		public actionSheetController: ActionSheetController,
		public modalController: ModalController) {
    this.generateListDynamically();
    this.isValid = false;
    this.messages = <Subject<any>> this.droneSock
      .connect()
      .map((res: any): any => {
        return res;
      });


    this.messages.subscribe( detection => {
      this.count++;
      // if (this.count % 2 === 0) {
        // console.log(detection);
      let currentObj = detection.data.objects;
      let response;
      // currentObj.forEach((value) => {
      //   console.log(value);
      //   response += value.name + ", ";
      // });
      this.presentToast(currentObj[0].name);
    });

  }

  ngAfterViewInit() {
  }

  generateListDynamically() {
    this.droneList.push( new DroneData('DJI Mavic Pro', 2000, '10.0.0.1', './assets/drone-icons/drone-1.svg', ''));
    this.droneList.push( new DroneData('DJI Mavic Air', 3000, '10.0.0.2', './assets/drone-icons/drone-2.svg', ''));
    this.droneList.push( new DroneData('DJI Spark', 4000, '10.0.0.3', './assets/drone-icons/drone-3.svg', ''));

    let tempDrone = new DroneData('DJI Inspire 2', 5000, '10.0.0.4', 'assets/drone-icons/drone-4.svg', '');
    tempDrone.setConnected(true);

    this.droneList.push(tempDrone);


  }

  connectDrone(event) {

	console.log(this.messages);

    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    this.droneList[index].setConnected(true);
  }

  disconnectDrone(event) {
    // TODO: Add prompt to ask if sure to disconnect

    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    this.droneList[index].setConnected(false);
  }
  async presentToast(animal) {
    const toast = await this.toastController.create({
      message: `Animal ${animal} spotted!`,
      duration: 2000
    });
    toast.present();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Drone Info',
      buttons: [ {
        text: 'View Info',
        handler: () => {
          console.log('Delete clicked');
			this.presentModal();
        }

      }, {
        text: 'Disconnect',
		role: 'destructive',
        handler: () => {
          console.log('Share clicked');

        }

      }
      ]

    });
    await actionSheet.present();

  }
	async presentModal() {
    const modal = await this.modalController.create({
      component: FlightSessionComponent,
      componentProps: { value: 123 }
    });
    return await modal.present();
  }
}
