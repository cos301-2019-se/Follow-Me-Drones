import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import { DroneState } from '../drone/drone-state.enum';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class DroneSocketService {
  private socket;
  private socketConnected: boolean;
  private state: DroneState;

  constructor() {
    this.socketConnected = false;
  }
  connectDrone() {
    this.socket.emit('connect_drone');
  }
  armDrone() {
    this.socket.emit('arm_drone');
  }
  disArm() {
    this.socket.emit('disarm_drone');
  }

  isConnected() {
    return this.socket.connected;
  }

  disconnectDrone() {
    this.socket.disconnect();
  }

  emitDisconnect() {
    this.socket.emit('disconnect', () => {
      console.log('emitted');
    });
  }

  constructSocketEventObject(event, data) {
    return  {
      event,
      data
    };

  }
  serverOnline(done, url) {
    // const request = new XMLHttpRequest();
    // request.onreadystatechange = function() {
    //   if (this.readyState === 4 && this.status === 200) {
    //     console.log(this);
    //     done(true);
    //   } else if (this.readyState === 4 && this.status === 0) {
    //     done(false);
    //   }
    // };
    // request.open('GET', url, true);
    // request.withCredentials = false;
    // request.setRequestHeader('Content-Type', 'application/json');
    // request.send();

    $.ajax({
      type: 'GET',
      url,
      success: (ret) => {
        console.log('in ajax');
        done(true);
      },
      error: (err) => {
        done(false);
      },
      contentType: 'application/json'
    });


  }

  connectSocket(ip, port, done): Rx.Subject<MessageEvent> {

    // let down = Len && Brendon;
    const socketSettings = {
      reconnection: false,
      reconnectionAttempts: 5,
    };

    // ping server here

    // this.socket = io.connect(`http://${ip}:${port}`, socketSettings);
    this.socket = io.connect(`http://${ip}:${port}`, socketSettings);
    console.log(this.socket);

    const thisSocket = this;
    const connectedCallback = done;

    let observable = new Observable( observer => {
      // SOCKET CONNECTION
      this.socket.on('connect', (data) => {
        console.log('Connected! | in drone-socket service');
        let obj = this.constructSocketEventObject('connect', data);
        // thisSocket.connected = true;
        connectedCallback(this.socket.connected);
        observer.next(obj);
      })
      this.socket.on('drone_armed', (data) => {
        console.log('armed! | in drone-socket service');
        let obj = this.constructSocketEventObject('drone_armed', data);
        // thisSocket.connected = true;
        observer.next(obj);
      })
      this.socket.on('drone_disarmed', (data) => {
        console.log('disarmed! | in drone-socket service');
        let obj = this.constructSocketEventObject('drone_disarmed', data);
        // thisSocket.connected = true;
        observer.next(obj);
      })

      this.socket.on('detection', (data) => {
        console.log('detection | in drone-socket service');
        const obj = this.constructSocketEventObject('detection', data);
        observer.next(obj);
      })
      this.socket.on('disconnect', (data) => {
        this.socketConnected = false;
        const obj = this.constructSocketEventObject('disconnect', data);
        console.log('disconnect!!! | in drone-socket service');
        observer.next(obj);
      })
      this.socket.on('reconnect_attempt', (data) => {
        const obj = this.constructSocketEventObject('reconnect_attempt', data);
        console.log(data);
        console.log(`reconnect_attempt ${data}  | in drone-socket service`);
        observer.next(obj);
      })
      this.socket.on('reconnect_failed', (data) => {
        const obj = this.constructSocketEventObject('reconnect_failed', data);
        console.log(`reconnect_failed | in drone-socket service`);
        observer.next(obj);
      })
      this.socket.on('connect_success', (data) => {
        console.log('connect_success ! | in drone-socket service');
        let obj = this.constructSocketEventObject('connect_success', data);
        observer.next(obj);
      })
      this.socket.on('drone_busy', (data) => {
        console.log('drone_busy ! | in drone-socket service');
        let obj = this.constructSocketEventObject('drone_busy', data);
        observer.next(obj);
      })
      this.socket.on('connect_error', (error) => {
        console.log(' Connection error| in drone-socket service');
        console.log(error);
        let obj = this.constructSocketEventObject('connect_error', error);
        observer.next(obj);
      })
      return () => {
        this.socket.disconnect();
      }
    });

    let observer = {
      next: (data: Object) => {
        this.socket.emit('message', JSON.stringify(data));
        console.log('message from my socket');
      },
      error: ((error) => {
        console.log(error);
      }),
      complete: () => {
        console.log('completed');
      }
    };

    return Rx.Subject.create(observer, observable);
  }
}
