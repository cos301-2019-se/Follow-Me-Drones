import { Component, AfterViewInit } from '@angular/core';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../../services/drone-socket/drone-socket.service';
import { Observable, Subject } from 'rxjs/Rx';
import { ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { FlightSessionComponent } from '../flight-session/flight-session.component';
import { Drone } from '../../services/drone/drone';
// import { DatabaseService } from '../../services/database/database.service';
//import { SqliteService } from '../../services/database/sqlite.service';

@Component({
  selector: 'app-drone-list',
  templateUrl: './drone-list.component.html',
  styleUrls: ['./drone-list.component.scss'],
})

export class DroneListComponent implements AfterViewInit {
  private droneList: DroneData[] = [];
  private drones: Drone[] = [];
  isValid: boolean;
  messages: Subject<any>;
  count = 0;
  // db: DatabaseService;
  constructor(private droneSock: DroneSocketService,
              public toastController: ToastController,
              public actionSheetController: ActionSheetController,
              public modalController: ModalController) {
    this.generateListDynamically();
    // this.db = new DatabaseService( new SqliteService() );
    // console.log(this.db);
    // this.messages = <Subject<any>> this.droneSock
    //   .connect()
    //   .map((res: any): any => {
    //     return res;
    //   });


    // this.messages.subscribe( detection => {
    //   this.count++;
    //   let currentObj = detection.data.objects;
    //   let response;
    //   this.presentToast(currentObj[0].name);
    // });

  }

  ngAfterViewInit() {
  }

  generateListDynamically() {
    /* ========================================================================================================================
     *  Totolink
     *======================================================================================================================
     */
    this.drones.push( new Drone(new DroneData('Jetson Nano 5', 6969, '192.168.1.16', './assets/drone-icons/drone-1.svg', '')));
    this.drones.push( new Drone(new DroneData('Jetson Nano !5', 6969, '192.168.1.12', './assets/drone-icons/drone-2.svg', '')));
    this.drones.push( new Drone(new DroneData('Brendon Laptop', 6969, '192.168.1.13', './assets/drone-icons/drone-3.svg', '')));
    this.drones.push( new Drone(new DroneData('Devon Laptop', 6969, '192.168.1.15', './assets/drone-icons/drone-4.svg', '')));
    this.drones.push( new Drone(new DroneData('Devon Desktop', 42069, '127.0.0.1', './assets/drone-icons/drone-4.svg', '')));

    /* ======================================================================================================================== */


    /* ========================================================================================================================
     *  Gilad Home
     *======================================================================================================================
     */
    //this.drones.push( new Drone(new DroneData('Jetson Nano 5', 6969, '192.168.1.32', './assets/drone-icons/drone-1.svg', '')));
   // this.drones.push( new Drone(new DroneData('Jetson Nano !5', 6969, '192.168.1.17', './assets/drone-icons/drone-2.svg', '')));
    //this.drones.push( new Drone(new DroneData('Brendon Laptop', 6969, '192.168.1.28', './assets/drone-icons/drone-3.svg', '')));
    //this.drones.push( new Drone(new DroneData('Devon Laptop', 6969, '192.168.1.23', './assets/drone-icons/drone-4.svg', '')));
    /* ======================================================================================================================== */

  }
  getClickedDrone(event) {
    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    return index;

  }

  armDrone(event) {
    const  index = this.getClickedDrone(event);
    console.log(`selected -> ${index}`);
    this.drones[index].armDrone();
  }


  async connectDrone(event) {
    const index = this.getClickedDrone(event);
    await this.drones[index].connect();
    const currentDrone = this.drones[index];
    this.drones[index].messages.subscribe( detection => {
      const currentObj = detection.data.objects;
      this.presentToast(`${currentDrone.dronedata.name} spotted ${currentObj[0].name}`);
      console.log(currentObj[0].name);
    });

    if (this.drones[index].isConnected()) { // TODO: if drone is found
      console.log('Drone successfully connected');
    } else {
      console.log('snne');
      alert('nee');
      // TODO: Notify user that drone is not available

    }
  }

  disconnectDrone(event) {
    // TODO: Add prompt to ask if sure to disconnect

    const index = this.getClickedDrone(event);

    this.drones[index].disconnect();
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async presentActionSheet(event) {

    const index = this.getClickedDrone(event);
    const clickedDrone = this.drones[index];

    const actionSheet = await this.actionSheetController.create({
      header: 'Drone Info',
      buttons: [ {
        text: 'View Info',
        handler: () => {
          console.log('Delete clicked');
          this.presentModal(clickedDrone);
        }

      }, {
        text: 'Disconnect',
        role: 'destructive',
        handler: () => {
          console.log('Disconnect clicked');

        }

      }
      ]

    });
    await actionSheet.present();

  }
  async presentModal(event) {

    const index = this.getClickedDrone(event);
    const clickedDrone = this.drones[index];

    const modal = await this.modalController.create({
      component: FlightSessionComponent,
      componentProps: { drone: clickedDrone }
    });
    return await modal.present();
  }
}
