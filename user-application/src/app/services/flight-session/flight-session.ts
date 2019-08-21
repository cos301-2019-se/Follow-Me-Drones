import { DroneState } from '../drone-data/drone/drone-state.enum';
export class FlightSession {
  private detectionImages: string [] = [];
  private sessionName: string;
  public active: boolean;
  private droneName;
  constructor() {
    console.log('Arming drone!');
    this.active = true;
    this.sessionName = 'mock_name';
    this.droneName = 'mock_drone_name'
  }
  setSessionName(sessionName) {
    this.sessionName = sessionName;
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
  getSessionName() {
    return this.sessionName;
  }
  isActive(): boolean {
    return this.active;
  }
  getDroneName() {
    return this.droneName;
  }
  getFirstImage() {
    if (this.detectionImages[0] !== undefined) {
      return this.detectionImages[this.detectionImages.length - 1];
    } else {
      return './assets/mockshots/predictionRhino.jpg';
    }
  }
}
