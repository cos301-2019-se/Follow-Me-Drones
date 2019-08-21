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
import { AlertController } from '@ionic/angular';

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
  constructor(
              public toastController: ToastController,
              public actionSheetController: ActionSheetController,
              public modalController: ModalController,
              public droneDataService: DroneDataService,
              public flightSessionController: FlightSessionController,
              public alertController : AlertController,
              public router: Router
  ) {
    this.drones = this.droneDataService.getDrones();
  }
  
  ngAfterViewInit() {
    const thisClass = this;
    this.drones.forEach( (drone) => {
        thisClass.checkOneDroneStatus(drone);
    });
  }

  checkOneDroneStatus(drone) {
      drone.serverOnline( (online) => {
        if (online) {
          drone.setDroneState(DroneState.ONLINE);
        } else {
          drone.setDroneState(DroneState.OFFLINE);
        }
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
    await toast.present(); //This bliksem
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

    const clickedDrone = await drone; //This other bliksem

    const modal = await this.modalController.create({
      component: FlightSessionComponent,
      componentProps: { drone: clickedDrone }
    });
    return await modal.present();
  }

  /* Function to confirm permanent deletion of an existing drone */
  async presentDeleteConfirmation(drone, slidingItem: IonItemSliding) {
    const alert = await this.alertController.create({
      message: 'Are you sure you want to permanently delete this drone?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            slidingItem.close();
          }
        },
        {
          cssClass: 'yes-button',
          text: 'Yes',
          handler: () => {
            this.deleteDrone(drone, slidingItem);
          }
        }
      ]
    });
    await alert.present();
  }
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // Drone Settings
  ////////////////////////////////////////////////////////////////////////////////
  /* Function to detect which direction user swiped and invokes appropriate function */
  async swipeEvent(drone, slidingItem : IonItemSliding){
    await slidingItem.getSlidingRatio()
    .then((slidingRatio) => {
      if(slidingRatio.valueOf() < 0) {
        this.editDrone(drone, slidingItem);
      } else if(slidingRatio.valueOf() > 0) {
        this.presentDeleteConfirmation(drone, slidingItem);
      }
    });
  }
  
  /* Function to modify existing drone settings */
  editDrone(drone, slidingItem: IonItemSliding) {
    this.router.navigate(['/tabs/tab2/edit-drone', drone.id]);
    slidingItem.close();
  }
  
  /* Function to permanently delete an existing drone */
  deleteDrone(drone, slidingItem: IonItemSliding) {
    this.droneDataService.deleteDrone(drone);
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
