import { Component, AfterViewInit, HostListener } from '@angular/core';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../../services/drone-socket/drone-socket.service';
import { Observable, Subject } from 'rxjs/Rx';
import { ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { FlightSessionComponent } from '../flight-session/flight-session.component';
import { Drone } from '../../services/drone/drone';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { DroneState } from '../../services/drone/drone-state.enum';


@Component({
  selector: 'app-drone-list',
  templateUrl: './drone-list.component.html',
  styleUrls: ['./drone-list.component.scss'],
})


export class DroneListComponent implements AfterViewInit {

  private drones: Drone[] = [];
  messages: Subject<any>;

  @HostListener('window:unload', ['$event'])

  public beforeunloadHandler($event) {
    console.log(this.drones);
    this.drones.forEach( (currentDrone) => {
      if (currentDrone.getState() === DroneState.ACTIVE) {
        currentDrone.disconnectDrone();
      }
    });
    $event.returnValue = 'Are you sure?';
  }

  constructor(public toastController: ToastController,
              public actionSheetController: ActionSheetController,
              public modalController: ModalController) {

    this.generateListDynamically(); // TODO: Replace with persistent data service.
  }

  ngAfterViewInit() {
    const thisClass = this;
    this.drones.forEach( (currentDrone) => {
      thisClass.connectOneSocket(currentDrone);
    });
  }
  connectOneSocket(drone) {

    drone.setDroneState(DroneState.ATTEMPT_ACTIVE);
    drone.connectSocket( (droneConnected) => {
        if (droneConnected === DroneState.ACTIVE) { // TODO: if drone is found
          console.log('Socket connected');
        } else {
          console.log('Socket not connected');
        }
    });

    this.setSocketEvents(drone);
  }
  setSocketEvents(drone) {
    const currentClass = this;
    drone.messages.subscribe( {

      next: (socketEvent)  => {
        if (socketEvent.event === 'detection') {
          const currentObj = socketEvent.data.data.objects; // TODO: change when Devon sends different format from the server
          console.log(currentObj);
          this.presentToast(`${drone.dronedata.name} spotted ${currentObj[0].name}`);
          console.log(currentObj[0].name);

        } else if (socketEvent.event === 'disconnect') {
          drone.setDroneState(DroneState.ATTEMPT_ACTIVE);
          console.log('disconnected in next() | Set drone to ATTEMPT_ACTIVE');

        } else if ( socketEvent.event === 'connect') {
          console.log('connected in next()');

        } else if ( socketEvent.event === 'reconnect_attempt') {
          drone.reconnect();
          console.log('reconnected in next()');
        } else if ( socketEvent.event === 'reconnect_failed') {
          drone.setDroneState(DroneState.OFFLINE);
          console.log('Reconnection failed | Set drone to OFFLINE');
        } else if ( socketEvent.event === 'connect_success') {
          drone.setDroneState(DroneState.CONNECTED);
          console.log('dronelist conn status');
        } else if (socketEvent.event === 'drone_armed') {
          drone.setDroneState(DroneState.ARMED);
          console.log('dronelist armed!asldkjfsaldfjsladfjkasljkdflsfjkd');
        } else if (socketEvent.event === 'drone_busy') {
          drone.setDroneState(DroneState.BUSY);
          console.log('drone busy');
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

  generateListDynamically() {
    /* ========================================================================================================================
     *  Localhost
     *======================================================================================================================
     */
    // this.drones.push( new Drone(new DroneData('Brendon Laptop', 8080, '127.0.0.1', './assets/drone-icons/drone-3.svg', '')));
    // this.drones.push( new Drone(new DroneData('Brendon Laptop 2', 6969, '127.0.0.1', './assets/drone-icons/drone-3.svg', '')));

    /* ========================================================================================================================
     *  Totolink
     *======================================================================================================================
     */
    // this.drones.push( new Drone(new DroneData('Jetson Nano 5', 6969, '192.168.1.16', './assets/drone-icons/drone-1.svg', '')));
    // this.drones.push( new Drone(new DroneData('Jetson Nano !5', 6969, '192.168.1.12', './assets/drone-icons/drone-2.svg', '')));
    // this.drones.push( new Drone(new DroneData('Brendon Laptop', 6969, '192.168.1.13', './assets/drone-icons/drone-3.svg', '')));
    this.drones.push( new Drone(new DroneData('Devon Laptop', 42069, '192.168.1.15', './assets/drone-icons/drone-4.svg', '')));

    /* ======================================================================================================================== */


    /* ========================================================================================================================
     *  Gilad Home
     *======================================================================================================================
     */
    // this.drones.push( new Drone(new DroneData('Jetson Nano 5', 6969, '192.168.1.32', './assets/drone-icons/drone-1.svg', '')));
   // this.drones.push( new Drone(new DroneData('Jetson Nano !5', 6969, '192.168.1.17', './assets/drone-icons/drone-2.svg', '')));
    // this.drones.push( new Drone(new DroneData('Brendon Laptop', 6969, '192.168.1.28', './assets/drone-icons/drone-3.svg', '')));
    // this.drones.push( new Drone(new DroneData('Devon Laptop', 6969, '192.168.1.23', './assets/drone-icons/drone-4.svg', '')));
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

  armDrone(drone) {
    drone.startFlightSession();
  }

  connectDrone(drone) {
    drone.connectDrone();
  }

  disconnectDrone(drone) {
    // TODO: Add prompt to ask if sure to disconnect
    drone.disconnectDrone();
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
  // ===================================================================================
  // Drone STATUS checks
  // ===================================================================================
  isOffline(drone) {
    return drone.getState() === DroneState.OFFLINE ? true : false;
  }
  isAttemptActive(drone) {
    return drone.getState() === DroneState.ATTEMPT_ACTIVE ? true : false;
  }
  isActive(drone) {
    return drone.getState() === DroneState.ACTIVE ? true : false;
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
  // ===================================================================================

}
