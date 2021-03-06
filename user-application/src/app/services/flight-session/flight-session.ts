import { UUID } from 'angular2-uuid';

import { DroneState } from '../drone-data/drone/drone-state.enum';
export class FlightSession {
  public detectionImages: string [] = [];
  public sessionName: string;
  public active: boolean;
  public droneName: string;
  public sessionID: string;
  constructor() {
    console.log('Arming drone!');
    this.active = true;
    this.sessionName = 'mock_name';
    this.sessionID = UUID.UUID();
    // this.droneName = 'Brendon Laptop';
  }
  setSesssion( obj ) {
    this.sessionName = obj.sessionName;
    this.detectionImages = obj.detectionImages;
    this.active = obj.active;
    this.droneName = obj.droneName;
    this.sessionID = obj.sessionID;
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
  getID() {
    return this.sessionID;
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
