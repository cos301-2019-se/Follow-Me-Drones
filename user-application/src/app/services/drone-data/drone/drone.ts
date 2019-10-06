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
  coords: any;
  intCoord: number;
  serverLocation: string;

  socket: DroneSocketService;
  messages: Subject<any>;
  connectionStatus: Subject<any>;
  geolocation: any;


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
    // this.stopPingCoordinates();
  }
  setGeolocationInfo(geo) {
    this.geolocation = geo;
  }

  pingCoordinates() {
    const currentClass = this;
    const socket = this.socket;
    this.coords = setInterval( () => {
      this.geolocation.getCurrentPosition().then((resp) => {
        // console.log(`currentLocation!\n lat: ${resp.coords.latitude} \n lon: ${resp.coords.longitude}`);
        // console.log(currentClass.coords);
        const url = this.serverLocation + '/coords';
        const c = {
          lon: resp.coords.latitude,
          lat: resp.coords.longitude
        };
        // socket.sendCoords(url, JSON.stringify(c));
        // alert(`lon: ${c.lon} \n  lat ${c.lat}`);
      }).catch((error) => {
        console.log('Error getting location', error);
        alert('error');
      });
    }, 5000);
    console.log(this.coords);
  }

  stopPingCoordinates() {
    console.log(this.coords);
    clearInterval(this.coords);
    for ( let i = 0; i < 1000; i++) {
      clearInterval(i);
    }
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
          const animal = socketEvent.data.detection;
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
          // start pinging coordinates
          drone.setDroneState(DroneState.ARMED);

        } else if (socketEvent.event === 'drone_busy') {
          drone.setDroneState(DroneState.BUSY);

        } else if (socketEvent.event === 'drone_disarmed') {
          console.log('CHANGE STATE TO: CONNECTED');
          drone.setDroneState(DroneState.CONNECTED);
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
