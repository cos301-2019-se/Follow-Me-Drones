import { DroneState } from '../drone-data/drone/drone-state.enum';
export class FlightSession {
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
