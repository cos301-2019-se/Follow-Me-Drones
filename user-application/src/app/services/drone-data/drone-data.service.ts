import { Injectable } from '@angular/core';
import { Drone } from './drone/drone';
import { Storage } from '@ionic/storage';
import { UUID } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class DroneDataService {
  private drones: Drone [] = [];
  constructor( private storage: Storage) {

    // this.storage.set('cf2adaf8-1479-89a1-f726-004361cfaa59',
    //   JSON.stringify(
    //     new Drone('cf2adaf8-1479-89a1-f726-004361cfaa59', 'Laptop 1', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', '')
    //   ));
    // this.storage.set('80f9f955-54d2-f6d3-09f0-23a9eb5df0cd',
    //   JSON.stringify(
    //     new Drone('80f9f955-54d2-f6d3-09f0-23a9eb5df0cd', 'Jetson Nano 5', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', '')
    //   ));
    // this.storage.set('9ce62288-c418-11e9-aa8c-2a2ae2dbcce4',
    //   JSON.stringify(
    //     new Drone('9ce62288-c418-11e9-aa8c-2a2ae2dbcce4', 'Jetson Nano !5', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', '')
    //   ));
    const currentClass = this;
    this.storage.forEach( (value, key, index) => {
      const currentStoredDrone = JSON.parse(value);
      currentClass.drones.push(
        new Drone( currentStoredDrone.id, currentStoredDrone.name, currentStoredDrone.port, currentStoredDrone.ipAddress,
                   currentStoredDrone.icon, currentStoredDrone.comment )
      );
    });


    /* ========================================================================================================================
     *  Parrot
     *======================================================================================================================
     */
    // this.drones.push( new Drone('Brendon Laptop', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', ''));
    // this.drones.push( new Drone('cf2adaf8-1479-89a1-f726-004361cfaa59', 'Devon Laptop', 42069, '192.168.42.97', './assets/drone-icons/drone-3.svg', ''));

    /* ========================================================================================================================
     *  Localhost
     *======================================================================================================================
     */
    // this.drones.push( new Drone('Brendon Laptop', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', ''));

    // this.drones.push( new Drone('cf2adaf8-1479-89a1-f726-004361cfaa59', 'Brendon Laptop 2', 42069, '127.0.0.1', './assets/drone-icons/drone-3.svg', ''));


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
    this.storage.set( drone.id, JSON.stringify(drone) );
    this.drones.push(drone);
  }
  updateDrone(drone) {
    this.storage.remove(drone.id);
    this.storage.set(drone.id, JSON.stringify(drone));
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
