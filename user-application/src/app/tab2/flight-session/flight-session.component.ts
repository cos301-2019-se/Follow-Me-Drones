import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { DroneData } from '../../../data-models/drone-data.model';
import { Drone } from '../../services/drone/drone';
@Component({
  selector: 'app-flight-session',
  templateUrl: './flight-session.component.html',
  styleUrls: ['./flight-session.component.scss'],
})
export class FlightSessionComponent implements OnInit {
  images = [1, 2, 3].map(() => `https://picsum.photos/900/500?random&t=${Math.random()}`);

  // images = ['assets/mockshots/predictionGiraffe.jpg',
  //   'assets/mockshots/predictionLeopard.jpg',
  //   'assets/mockshots/predictionLion.jpg',
  //   'assets/mockshots/predictionRhino.jpg'];

  ImageIndex = 0;
  dronedata: DroneData;
  drone: Drone;
  constructor(public navParam: NavParams) {
    // console.log(navParam.get('drone').dronedata);
    this.drone = navParam.get('drone');
    this.dronedata = this.drone.dronedata;
  }
  armDrone() {
    this.drone.armDrone();
  }

  viewPhoto() {
    alert("Function Test: Photo full screen");
  }

  liftOff() {
    alert("Lift Off");
  }

  returnHome() {
    alert("Return Home");
  }

  ngOnInit() {
  }

  updateIndex(s) {
    this.ImageIndex = s;
  }
}
