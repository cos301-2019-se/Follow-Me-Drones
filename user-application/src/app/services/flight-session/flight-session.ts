import { Drone } from '../drone/drone';
import { DroneState } from '../drone/drone-state.enum';
export class FlightSession {
  private drone: Drone;
  private detectionImages: string [] = [];

  constructor() {
    console.log('Arming drone!');
  }
  addImage(image) {
    this.detectionImages.unshift('data:image/jpg;base64,' + image);
  }
  getImage(index) {
    return this.detectionImages[index];
  }
  getImages() {
    return this.detectionImages;
  }
}
