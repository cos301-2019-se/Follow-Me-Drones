import { Observable, Subject } from 'rxjs/Rx';
import { DroneData } from '../../../data-models/drone-data.model';
import { DroneSocketService } from '../drone-socket/drone-socket.service';
import { DroneState } from './drone-state.enum';
import { FlightSessionController } from '../flight-session-controller/flight-session-controller';
import * as $ from 'jquery';

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
  serverLocation: string;

  socket: DroneSocketService;
  messages: Subject<any>;
  connectionStatus: Subject<any>;

  constructor( dronedata: DroneData) {

    this.state = DroneState.OFFLINE;
    this.dronedata = dronedata; // TODO: REMOVE
    this.name = dronedata.name;
    this.port = dronedata.port;
    this.ipAddress = dronedata.ipAddress;
    this.icon = dronedata.icon;

    this.flightController = new FlightSessionController(this);
    this.connected = false; // TODO: REMOVE

    this.socket = new DroneSocketService();
    this.serverLocation = `http://${this.ipAddress}:${this.port}`;

  }
  startFlightSession() {
    this.flightController.startSession();
  }
  endFlightSession() {
    this.flightController.endFlightSession();
  }

  fetchImage(image) {

    console.log('fetchImage >>>>>>>>>>>>.');
    const endpoint = '/image';
    const url = this.serverLocation + endpoint;

    const obj = {
      image
    };

    console.log(obj);
    const currentClass = this;
    setTimeout ( () => {
      $.ajax({
        type: 'POST',
        url,
        data: JSON.stringify(obj),
        success: (ret) => {
          ret = ret.substring(2, ret.length - 1);
          console.log('found image');
          currentClass.addImage(ret);
        },
        contentType: 'application/json'
      });
    } , 1000 );


    // const request = new XMLHttpRequest();
    // request.onreadystatechange = function() {
    //   if (this.readyState === 4 && this.status === 200) {
    //     console.log(request);
    //     // done(true);
    //   } else if (this.readyState === 4 && this.status === 0) {
    //     // done(false);
    //   }
    // };

    // request.open('POST', url, true);
    // request.withCredentials = false;
    // request.setRequestHeader('Content-Type', 'application/json');
    // request.send(`image_id=${image}`);
  }
  addImage(image) {
    this.flightController.addImage(image);
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
    const endpoint = '/ping';
    const url = this.serverLocation + endpoint;

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
