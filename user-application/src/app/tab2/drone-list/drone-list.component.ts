import { Component, AfterViewInit, HostListener } from '@angular/core';
import { DroneSocketService } from '../../services/drone-data/drone-socket/drone-socket.service';
import { Observable, Subject } from 'rxjs/Rx';
import { ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Drone } from '../../services/drone-data/drone/drone';
import { DroneState } from '../../services/drone-data/drone/drone-state.enum';
import { DroneDataService } from '../../services/drone-data/drone-data.service';
import { FlightSessionComponent } from '../flight-session/flight-session.component';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

@Component({
  selector: 'app-drone-list',
  templateUrl: './drone-list.component.html',
  styleUrls: ['./drone-list.component.scss'],
})


export class DroneListComponent implements AfterViewInit {

  ////////////////////////////////////////////////////////////////////////////////
  // Init
  ////////////////////////////////////////////////////////////////////////////////
  private drones: Drone[] = [];
  messages: Subject<any>;
  constructor(public toastController: ToastController,
              public actionSheetController: ActionSheetController,
              public modalController: ModalController,
              public droneDataService: DroneDataService,
              public flightSessionController: FlightSessionController,
              public router: Router
  ) {
    this.drones = this.droneDataService.getDrones();
  }

  ngAfterViewInit() {
    const thisClass = this;
    this.drones.forEach( (drone) => {
      drone.serverOnline( (online) => {
        if (online) {
          drone.setDroneState(DroneState.ONLINE);
        } else {
          drone.setDroneState(DroneState.OFFLINE);
        }
      });
    });
  }
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // Flight Sessions
  ////////////////////////////////////////////////////////////////////////////////
  startSession(drone) {
    if (!this.flightSessionController.startFlightSession(drone)) {
      // TODO: Let user know accordingly
      alert('Problem!');
    }

  }

  endSession(drone) {
    this.flightSessionController.endFlightSession(drone);
  }
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // Connection
  ////////////////////////////////////////////////////////////////////////////////
  connectDrone(drone) {
    drone.connectDrone(this, (droneConnected) => {
      if (droneConnected) {
        drone.setDroneState(DroneState.CONNECTED);
      } else {
=======
  generateListDynamically() {
    /* ========================================================================================================================
     *  Totolink
     *======================================================================================================================
     */
    this.drones.push( new Drone(new DroneData('Jetson Nano 5', 6969, '192.168.1.16', './assets/drone-icons/drone-1.svg', '')));
    this.drones.push( new Drone(new DroneData('Jetson Nano !5', 6969, '192.168.1.12', './assets/drone-icons/drone-2.svg', '')));
    this.drones.push( new Drone(new DroneData('Brendon Laptop', 6969, '192.168.1.13', './assets/drone-icons/drone-3.svg', '')));
    this.drones.push( new Drone(new DroneData('Devon Laptop', 42069, '192.168.1.23', './assets/drone-icons/drone-4.svg', '')));
    this.drones.push( new Drone(new DroneData('Devon Desktop', 42069, '127.0.0.1', './assets/drone-icons/drone-4.svg', '')));
>>>>>>> feature/drone-camera-feed

      }

    });

    // this.setupSocketEvents(drone);
  }

  disconnectDrone(drone) {
    // TODO: Add prompt to ask if sure to disconnect
    drone.disconnectDrone();
    // drone.endFlightSession();
  }

  setupSocketEvents(drone) {
    const currentClass = this;
    drone.messages.subscribe( {
      next: (socketEvent)  => {
        if (socketEvent.event === 'detection') {
          const animal = socketEvent.data.detection;
          // drone.fetchImage( socketEvent.data.image );
          this.flightSessionController.detection(drone, socketEvent.data);
          let message =  `${drone.name} spotted ${animal}`;
          message = 'Now that is an Avengers level threat!';
          this.presentToast(message);
        } else if (socketEvent.event === 'disconnect') {
          drone.setDroneState(DroneState.ONLINE);

        } else if ( socketEvent.event === 'connect') {
          console.log('connected in next()');

        } else if ( socketEvent.event === 'reconnect_attempt') {
          drone.reconnect();

        } else if ( socketEvent.event === 'reconnect_failed') {
          drone.setDroneState(DroneState.OFFLINE);

        } else if ( socketEvent.event === 'connect_success') {
          drone.setDroneState(DroneState.CONNECTED);

        } else if (socketEvent.event === 'drone_armed') {
          drone.setDroneState(DroneState.ARMED);

        } else if (socketEvent.event === 'drone_busy') {
          drone.setDroneState(DroneState.BUSY);

        } else if (socketEvent.event === 'drone_disarmed') {
          drone.setDroneState(DroneState.CONNECTED);
        }
      },
      error: (error)  => {
        console.log(error);
      },
      complete: () => {
        console.log('completed');
      }
    });
  }
  ////////////////////////////////////////////////////////////////////////////////



  ////////////////////////////////////////////////////////////////////////////////
  // Notifications and Popups
  ////////////////////////////////////////////////////////////////////////////////
  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async presentActionSheet(drone) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Drone Info',
      buttons: [ {
        text: 'View Info',
        handler: () => {
          console.log('Delete clicked');
          this.presentModal(drone);
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
  async presentModal(drone) {

    const clickedDrone = drone;

    const modal = await this.modalController.create({
      component: FlightSessionComponent,
      componentProps: { drone: clickedDrone }
    });
    return await modal.present();
  }
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // Drone Settings
  ////////////////////////////////////////////////////////////////////////////////
  editDrone(drone, slidingItem: IonItemSliding) {
    this.router.navigate(['/tabs/tab2/edit-drone', drone.id]);
    slidingItem.close();
  }
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // Drone Status Checks
  ////////////////////////////////////////////////////////////////////////////////
  isOffline(drone) {
    return drone.getState() === DroneState.OFFLINE ? true : false;
  }
  isOnline(drone) {
    return drone.getState() === DroneState.ONLINE ? true : false;
  }
  isConnecting(drone) {
    return drone.getState() === DroneState.CONNECTING ? true : false;
  }
  isConnected(drone) {
    return drone.getState() === DroneState.CONNECTED ? true : false;
  }
  isArming(drone) {
    return drone.getState() === DroneState.ARMING ? true : false;
  }
  isArmed(drone) {
    return drone.getState() === DroneState.ARMED ? true : false;
  }
  isBusy(drone) {
    return drone.getState() === DroneState.BUSY ? true : false;
  }
  ////////////////////////////////////////////////////////////////////////////////
  onSelect( drone ) {
    this.router.navigate(['/tabs/tab2/flight-session', drone.id]);
  }

}
