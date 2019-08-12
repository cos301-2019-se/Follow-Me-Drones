import { Observable, Subject } from 'rxjs/Rx';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../drone-socket/drone-socket.service';
import { DroneState } from './drone-state.enum';
import { FlightSessionController } from '../flight-session-controller/flight-session-controller';

export class Drone {
  dronedata: DroneData;

  name: string;
  port: number;
  ipAddress: string;
  icon: string;
  state: DroneState;
  connected: boolean; // TODO: remove
  armed: boolean; // TODO: remove
  flightController: FlightSessionController;

  socket: DroneSocketService;
  messages: Subject<any>;
  connectionStatus: Subject<any>;
  constructor( dronedata: DroneData) {
    this.dronedata = dronedata; // TODO: REMOVE
    this.name = dronedata.name;
    this.port = dronedata.port;
    this.ipAddress = dronedata.ipAddress;
    this.state = DroneState.ATTEMPT_ACTIVE;
    this.flightController = new FlightSessionController(this);
    this.connected = false; // TODO: REMOVE
  }
  startFlightSession() {
    this.flightController.startSession();
  }

  getState() {
    return this.state;
  }
  isConnected() {
    return  this.connected;
  }

  async reconnect() {
    this.connected = this.socket.isConnected();
  }


  connectSocket(done) {
    this.socket = new DroneSocketService();
    this.messages = <Subject<any>> this.socket.connectSocket( this.dronedata.ipAddress, this.dronedata.port, 
      () => {
      this.connected = this.socket.isConnected();
      this.state = DroneState.ACTIVE;
      done(this.state);
    })
    .map( (res: any): any => {
      return res;
    });

  }
  connectDrone(done) {
    this.socket.connectDrone(); // Emit connect_drone
  }
  disconnectDrone() {
    this.socket.disconnectDrone();
    this.state = DroneState.ACTIVE;
  }
  disconnect() {
    // console.log('Disconnecting myself!');
    this.messages.unsubscribe();
  }

  setDroneState( state) {
    this.state = state;
  }

  armDrone() {
    const setArmed = this.armed;
    this.socket.armDrone();
  }
  getName() {
    return this.dronedata.name;
  }
  getIcon() {
    return this.dronedata.icon;
  }
}
