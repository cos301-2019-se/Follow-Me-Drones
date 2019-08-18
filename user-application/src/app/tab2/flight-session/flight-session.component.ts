import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { DroneData } from '../../../data-models/drone-data.model';
import { Drone } from '../../services/drone/drone';
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
  dronedata: DroneData;
  drone: Drone;
  imageArray: string [];
  constructor(public navParam: NavParams) {
    this.drone = navParam.get('drone');
    this.dronedata = this.drone.dronedata;
    this.imageArray = this.drone.flightController.getCurrentFlightSession().getImages();
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

  ngOnInit() {

  }

  updateIndex(s) {
    this.activeImageIndex = s;
  }

  getDroneIcon() {
    return this.drone.icon;
  }

}
