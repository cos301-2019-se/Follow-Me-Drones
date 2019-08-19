import { Injectable } from '@angular/core';
import { Drone } from './drone/drone';

@Injectable({
  providedIn: 'root'
})
export class DroneDataService {
  private drones: Drone [] = [];
  constructor() {

    /* ========================================================================================================================
     *  Localhost
     *======================================================================================================================
     */
    // this.drones.push( new Drone('Brendon Laptop', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', ''));
    this.drones.push( new Drone('cf2adaf8-1479-89a1-f726-004361cfaa59', 'Brendon Laptop 2', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', ''));

    /* ========================================================================================================================
     *  Totolink
     *======================================================================================================================
     */
    // this.drones.push( new Drone(Jetson Nano 5', 6969, '192.168.1.16', './assets/drone-icons/drone-1.svg', ''));
    // this.drones.push( new Drone('Jetson Nano !5', 6969, '192.168.1.12', './assets/drone-icons/drone-2.svg', ''));
    // this.drones.push( new Drone('80f9f955-54d2-f6d3-09f0-23a9eb5df0cd','Brendon Laptop', 42069, '192.168.1.13', './assets/drone-icons/drone-3.svg', ''));
    // this.drones.push( new Drone('Devon Laptop', 42069, '192.168.1.15', './assets/drone-icons/drone-4.svg', ''));

    /* ======================================================================================================================== */


    /* ========================================================================================================================
     *  Gilad Home
     *======================================================================================================================
     */
    // this.drones.push( new Drone('Jetson Nano 5', 42069, '192.168.1.32', './assets/drone-icons/drone-1.svg', ''));
    // this.drones.push( new Drone('cf2adaf8-1479-89a1-f726-004361cfaa59', 'Jetson Nano !5', 42069, '192.168.1.16', './assets/drone-icons/drone-3.svg', ''));
    // this.drones.push( new Drone('Brendon Laptop', 42069, '192.168.1.28', './assets/drone-icons/drone-3.svg', ''));
    // this.drones.push( new Drone('Francois Laptop', 42069, '192.168.1.7', './assets/drone-icons/drone-3.svg', ''));
    // this.drones.push( new Drone('Devon Laptop', 42069, '192.168.1.23', './assets/drone-icons/drone-4.svg', ''));
    // this.drones.push( new Drone('Gilad Laptop', 42069, '192.168.1.19', './assets/drone-icons/drone-4.svg', ''));
    /* ======================================================================================================================== */
  }
  addNewDrone(drone) {
    this.drones.push(drone);
  }

  getDrones() {
    return this.drones;
  }

  getDrone(id) {
    let counter = 0;
    while ( counter < this.drones.length) {
      console.log( this.drones[counter].id + '   '  + id);
      if (this.drones[counter].id === id) {
        return this.drones[counter];
      }
      counter++;
    }
    console.log('None found');
  }

}
