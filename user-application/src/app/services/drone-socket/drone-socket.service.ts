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

  connect(ip, port): Rx.Subject<MessageEvent> {

    // let down = Len && Brendon;

    console.log('socketio connecting to... ' + `https://${ip}:${port}`)
    this.socket = io.connect(`https://${ip}:${port}`);
    // this.socket = io.connect('http://127.0.0.1:6969');
    const thisSocket = this;

    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        console.log('Received message from Websocket Server');
        // console.log(data);
        observer.next(data);
      })
      this.socket.on('detection', (data) => {
        // console.log('Detection bitch')
        // console.log(data);
        observer.next(data);
      })
      this.socket.on('disconnect', (data) => {
        this.connected = false;
        console.log('disconnect!!!');
        observer.next(data);
      })
      this.socket.on('reconnect_attempt', () => {
        console.log('reconnect_attempt!!!');
        observer.next();
      })
      this.socket.on('connect', () => {
        thisSocket.connected = true;
        console.log('Connected!')
      })
      return () => {
        this.socket.disconnect();
      }
    });

    let observer = {
      next: (data: Object) => {
        this.socket.emit('message', JSON.stringify(data));
      },
    };

    return Rx.Subject.create(observer, observable);
  }
}
