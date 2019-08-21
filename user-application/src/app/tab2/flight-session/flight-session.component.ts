import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { DroneData } from '../../../data-models/drone-data.model';
import { Drone } from '../../services/drone-data/drone/drone';
import { ActivatedRoute } from '@angular/router';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { DroneDataService } from '../../services/drone-data/drone-data.service';
import { DroneState } from '../../services/drone-data/drone/drone-state.enum';
import * as $ from 'jquery';

@Component({
  selector: 'app-flight-session',
  templateUrl: './flight-session.component.html',
  styleUrls: ['./flight-session.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FlightSessionComponent implements OnInit {
  // images = [1, 2, 3].map(() => `https://picsum.photos/900/500?random&t=${Math.random()}`);

    images = ['assets/mockshots/predictionGiraffe.jpg',
    'assets/mockshots/predictionLeopard.jpg',
    'assets/mockshots/predictionLion.jpg',
    'assets/mockshots/predictionRhino.jpg'];


  activeImageIndex = 0;
  drone: Drone;
  imageArray: string [];
  dataLoaded: boolean;

  constructor(
                private droneData: DroneDataService,
                private route: ActivatedRoute,
                private flightSessionController: FlightSessionController) {

  }

  ngOnInit() {
    this.drone = this.droneData.getDrone( this.route.snapshot.paramMap.get('drone'));
  }

  getImageSource(index) {
    return this.imageArray[index];
  }
  armDrone() {
    this.drone.armDrone();
  }

  viewPhoto() {
    alert('Function Test: Photo full screen');
  }

  liftOff() {
    alert('Lift Off');
  }

  returnHome() {
    alert('Return Home');
  }


  updateIndex(s) {
    this.activeImageIndex = s;
  }

  getDroneIcon() {
    return this.drone.icon;
  }

  isOffline() {
    return this.drone.getState() === DroneState.OFFLINE ? true : false;
  }
  isOnline() {
    return this.drone.getState() === DroneState.ONLINE ? true : false;
  }
  isConnecting() {
    return this.drone.getState() === DroneState.CONNECTING ? true : false;
  }
  isConnected() {
    return this.drone.getState() === DroneState.CONNECTED ? true : false;
  }
  isArming() {
    return this.drone.getState() === DroneState.ARMING ? true : false;
  }
  isArmed() {
    return this.drone.getState() === DroneState.ARMED ? true : false;
  }
  isBusy() {
    return this.drone.getState() === DroneState.BUSY ? true : false;
  }

  arrowToggle(element) {
      $(`#${element.el.id}`).toggleClass('arrow-rotated');
  }
}
