import { Observable, Subject } from 'rxjs/Rx';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../drone-socket/drone-socket.service';

export class Drone {
  dronedata: DroneData;

  name: string;
  port: number;
  ipAddress: string;
  icon: string;
  connected: boolean;

  socket: DroneSocketService;
  messages: Subject<any>;
  connectionStatus: Subject<any>;
  constructor( dronedata: DroneData) {
    this.dronedata = dronedata;
    this.connected = false;
  }
  isConnected() {
    return  this.connected;
  }
  async reconnect() {
    this.connected = this.socket.isConnected();
  }
  async connect(done) {
    this.socket = new DroneSocketService();
    
    this.messages = <Subject<any>> this.socket.connect( this.dronedata.ipAddress, this.dronedata.port, 
      () => {
      this.connected = this.socket.isConnected();
      done(this.connected);
    })
    .map( (res: any): any => {
      return res;
    });
    // await this.timeout(1000); // hackerman

  }
  async disconnect() {
    console.log('Disconnecting myself!');
    this.messages.unsubscribe();
    this.socket.disconnect();
    // this.socket.emitDisconnect();
    // this.connected = false;
  }
  setConnected(value) {
    console.log('Setting drone to disconnected');
    this.connected = value;
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
