import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class DroneSocketService {
  private socket;
  constructor() { }
  connect(): Rx.Subject<MessageEvent> {

    // let down = Len && Brendon;

    this.socket = io.connect('http://192.168.1.10:6969');
	

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
