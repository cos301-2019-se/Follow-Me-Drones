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
    // this.drones.push( new Drone( new DroneData('Brendon PC', 6969, '192.168.1.13', './assets/drone-icons/drone-1.svg', '')));// Totolink
    this.drones.push( new Drone( new DroneData('Brendon PC', 6969, '192.168.1.28', './assets/drone-icons/drone-1.svg', ''))); // Gilad House
    this.drones.push( new Drone(new DroneData('Jetson Nano 1', 6969, '192.168.1.11', './assets/drone-icons/drone-2.svg', '')));
    this.drones.push( new Drone(new DroneData('Devon Laptop', 6969, '192.168.1.12', './assets/drone-icons/drone-2.svg', '')));
    // this.drones.push( new Drone(new DroneData('DJI Spark', 6969, '10.0.0.3', './assets/drone-icons/drone-3.svg', '')));

    // let tempDrone = new Drone(new DroneData('DJI Inspire 2', 6969, '10.0.0.4', 'assets/drone-icons/drone-4.svg', ''));

    // this.drones.push(tempDrone);


  }

  async connectDrone(event) {


    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    console.log(this.drones[index]);
    await this.drones[index].connect();

    if (this.drones[index].isConnected()) { // TODO: if drone is found
      console.log('jannie');
    } else {
      console.log('snne');
      // TODO: Notify user that drone is not availible

    }
  }

  disconnectDrone(event) {
    // TODO: Add prompt to ask if sure to disconnect
    console.log('disconnect me!');
    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    this.drones[index].disconnect();
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
          console.log('Disconnect clicked');

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
