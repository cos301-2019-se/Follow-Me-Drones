import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class DroneSocketService {
  private socket;
  private connected: boolean;
  constructor() {
    this.connected = false;
  }
  armDrone() {
    this.socket.emit('arm', () => {
      alert('drone armed');
    });
  }
  isConnected() {
    return this.socket.connected;
  }

  disconnect() {
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

  connect(ip, port, done): Rx.Subject<MessageEvent> {

    // let down = Len && Brendon;

    this.socket = io.connect(`http://${ip}:${port}`);


    // this.socket = io.connect('http://127.0.0.1:6969');
    const thisSocket = this;
    const connectedCallback = done;

    let observable = new Observable(observer => {
      this.socket.on('detection', (data) => {
        console.log('detection | in drone-socket service');
        const obj = this.constructSocketEventObject('detection', data);
        observer.next(obj);
      })
      this.socket.on('disconnect', (data) => {
        this.connected = false;
        const obj = this.constructSocketEventObject('disconnect', data);
        console.log('disconnect!!! | in drone-socket service');
        observer.next(obj);
      })
      this.socket.on('reconnect_attempt', (data) => {
        const obj = this.constructSocketEventObject('reconnect_attempt', data);
        console.log('reconnect_attempt | in drone-socket service');
        observer.next(obj);
      })
      this.socket.on('connect', (data) => {
        console.log('Connected! | in drone-socket service');
        let obj = this.constructSocketEventObject('connect', data);
        thisSocket.connected = true;
        connectedCallback(this.socket.connected);
        observer.next(obj);
      })
      return () => {
        this.socket.disconnect();
      }
    });


    // let messageTest = new Observable(observer => {
    //   this.socket.on('message', () => {
    //     console.log('Received message from Websocket Server');
    //   })
    // });

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
