import { Observable, Subject } from 'rxjs/Rx';
import { DroneSocketService } from '../drone-socket/drone-socket.service';
import { DroneState } from './drone-state.enum';

export class Drone {
  id: string;
  name: string;
  port: number;
  ipAddress: string;
  icon: string;
  comment: string;

  state: DroneState;
  connected: boolean; // TODO: remove
  armed: boolean; // TODO: remove
  pingServer: any;
  serverLocation: string;

  socket: DroneSocketService;
  messages: Subject<any>;
  connectionStatus: Subject<any>;

  constructor(uuid, name, port, ipAddress, icon, comment) {
    this.id = uuid;
    this.state = DroneState.OFFLINE;
    this.name = name;
    this.port = port;
    this.ipAddress = ipAddress;
    this.icon = icon;
    this.comment = comment;

    this.connected = false; // TODO: REMOVE

    this.socket = new DroneSocketService();
    this.serverLocation = `http://${this.ipAddress}:${this.port}`;

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


  connectDrone(domObject, done) {
    console.log('sarie');
    this.messages = <Subject<any>> this.socket.connectSocket( this.ipAddress, this.port, done)
    .map( (res: any): any => {
      return res;
    });
    const currentClass = this;

    const drone = this;
    drone.messages.subscribe( {
      next: (socketEvent)  => {
        if (socketEvent.event === 'detection') {
          const animal = socketEvent.data.animal;
          // drone.fetchImage( socketEvent.data.image );
          domObject.flightSessionController.detection(drone, socketEvent.data);
          const message =  `${drone.name} spotted ${animal}`;
          // message = 'Now that is an Avengers level threat!';
          console.log(message);
          domObject.presentToast(message);
        } else if (socketEvent.event === 'disconnect') {
          console.log('CHANGE STATE TO: ONLINE');
          drone.setDroneState(DroneState.ONLINE);

        } else if ( socketEvent.event === 'connect') {
          console.log('connected in next()');

        } else if ( socketEvent.event === 'reconnect_attempt') {
          drone.reconnect();

        } else if ( socketEvent.event === 'reconnect_failed') {
          drone.setDroneState(DroneState.OFFLINE);

        } else if ( socketEvent.event === 'connect_success') {
          console.log('CHANGE STATE TO: CONNECTED');
          drone.setDroneState(DroneState.CONNECTED);
        } else if (socketEvent.event === 'drone_armed') {
          drone.setDroneState(DroneState.ARMED);

        } else if (socketEvent.event === 'drone_busy') {
          drone.setDroneState(DroneState.BUSY);

        } else if (socketEvent.event === 'drone_disarmed') {
          console.log('CHANGE STATE TO: CONNECTED');
          drone.setDroneState(DroneState.CONNECTED);
        } else if ( socketEvent.event === 'connect_error') {
          drone.setDroneState(DroneState.OFFLINE);
          // alert(socketEvent.data);

        }
      },
      error: (error)  => {
        console.log(error);
      },
      complete: () => {
        console.log('completed');
      }
    });

  }
  updateDrone(name, port, ipAddress, comment) {
    console.log('updated');
    this.name = name;
    this.port = port;
    this.ipAddress = ipAddress;
    this.comment = comment;
    this.serverLocation = `http://${this.ipAddress}:${this.port}`;
  }

  disconnectDrone() {
    this.socket.disconnectDrone();
    this.state = DroneState.ONLINE;
  }

  setDroneState( state) {
    this.state = state;
  }

  armDrone() {
    this.socket.armDrone();
  }

  getName() {
    return this.name;
  }

  getIcon() {
    return this.icon;
  }
}
