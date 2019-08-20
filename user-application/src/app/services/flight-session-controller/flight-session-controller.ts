import { Injectable } from '@angular/core';
import * as $ from 'jquery';
import { FlightSession } from '../flight-session/flight-session';
import { Drone } from '../drone-data/drone/drone';
import { DroneState } from '../drone-data/drone/drone-state.enum';

@Injectable({
  providedIn: 'root'
})


export class FlightSessionController {
  private pastSessions: Map< string, FlightSession[] >;
  private activeSessions: Map< string, FlightSession>;
  private numActiveSessions: number;

  constructor() {
    this.activeSessions = new Map<string, FlightSession>();
    this.pastSessions = new Map<string , FlightSession[]> ();
  }

  getCurrentSession(droneName) {
    if (this.activeSessions.get(droneName) !== undefined) {
      return this.activeSessions.get(droneName);
    }
    return null;
  }

  getPastSessions(droneName) {
    return this.pastSessions.get(droneName);
  }

  startFlightSession(drone) {

    if ( drone.getState() === DroneState.ARMED) {
      return false;
    }

    drone.armDrone();
    drone.setDroneState( DroneState.ARMING );
    this.activeSessions.set( drone.id, new FlightSession());
    return true;

  }

  endFlightSession(drone) {

    const oldPastSessions = this.pastSessions.get(drone.id);
    if ( oldPastSessions !== undefined ) {
      const updatedPastSessions = oldPastSessions.concat(this.activeSessions.get(drone.id));
      this.pastSessions.set(drone.id, updatedPastSessions);
    } else {
      const firstSession = Array(this.activeSessions.get(drone.id));
      this.pastSessions.set(drone.id, firstSession);
    }

    drone.disArm();
    drone.setDroneState( DroneState.CONNECTED);
    this.activeSessions.delete(drone.id);
  }


  detection(drone, data) {
    // TODO: Maybe Convert to httpsDroneService
    const endpoint = '/image';
    const obj = {
      image: data.image
    };
    console.log(drone.serverLocation);
    const currentClass = this;

    setTimeout ( () => {
      $.ajax({
        type: 'POST',
        url: drone.serverLocation + endpoint,
        data: JSON.stringify(obj),
        success: (ret) => {
          ret = ret.substring(2, ret.length - 1);
          currentClass.activeSessions.get(drone.id).addImage(ret);
        },
        contentType: 'application/json'
      });
    } , 1000 );

  }

}
