import { Observable, Subject } from 'rxjs/Rx';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../drone-socket/drone-socket.service';

export class Drone {
  dronedata: DroneData;
  socket: DroneSocketService;
  messages: Subject<any>;
  connected: boolean;
  constructor( dronedata: DroneData) {
    this.dronedata = dronedata;
    this.connected = false;
  }
  isConnected() {
    return  this.connected;
  }
  async connect() {
    console.log('connect!');
    this.socket = new DroneSocketService();
    this.messages = <Subject<any>> this.socket.connect( this.dronedata.ipAddress, this.dronedata.port)
      .map( (res: any): any => {
        return res;
      });

    await this.timeout(2000); // hackerman
    this.connected = this.socket.isConnected();

  }
  async disconnect() {
    console.log('Disconnecting myself!');
    this.messages.unsubscribe();
    this.socket.emitDisconnect();
    // this.socket.disconnect();
    this.connected = false;
  }
  armDrone() {
    this.socket.armDrone();
  }
  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  getName() {
    return this.dronedata.name;
  }
  getIcon() {
    return this.dronedata.icon;
  }
}
