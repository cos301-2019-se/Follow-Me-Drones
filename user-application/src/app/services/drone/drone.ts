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
  pingServer: any;
  flightController: FlightSessionController;

  socket: DroneSocketService;
  messages: Subject<any>;
  connectionStatus: Subject<any>;
  constructor( dronedata: DroneData) {

    this.state = DroneState.OFFLINE;
    this.dronedata = dronedata; // TODO: REMOVE
    this.name = dronedata.name;
    this.port = dronedata.port;
    this.ipAddress = dronedata.ipAddress;
    this.flightController = new FlightSessionController(this);
    this.connected = false; // TODO: REMOVE

    this.socket = new DroneSocketService();
  }
  startFlightSession() {
    this.flightController.startSession();
  }
  endFlightSession() {
    this.flightController.endFlightSession();
  }

  getState() {
    return this.state;
  }
  isConnected() {
    return  this.connected;
  }

  reconnect() {
    this.connected = this.socket.isConnected();
  }

  serverOnline(done) {
    const url = `http://${this.ipAddress}:${this.port}/ping`;

    const socket = this.socket;

    this.pingServer = setInterval( () => {
      socket.serverOnline((connected) => {
        if (connected) {
          clearInterval(this.pingServer);
          done(true);
        }
      }, url);
    }, 1000);

    return this.socket.serverOnline(done, url);
  }
  disArm() {
    this.socket.disArm();
  }


  connectDrone(done) {
    console.log('sarie');
    this.messages = <Subject<any>> this.socket.connectSocket( this.dronedata.ipAddress, this.dronedata.port, done)
    .map( (res: any): any => {
      return res;
    });

  }

  disconnectDrone() {
    this.socket.disconnectDrone();
    this.state = DroneState.ONLINE;
  }
  disconnect() {
    this.messages.unsubscribe();
  }

  setDroneState( state) {
    this.state = state;
  }

  armDrone() {
    this.socket.armDrone();
  }
  getName() {
    return this.dronedata.name;
  }
  getIcon() {
    return this.dronedata.icon;
  }
}
