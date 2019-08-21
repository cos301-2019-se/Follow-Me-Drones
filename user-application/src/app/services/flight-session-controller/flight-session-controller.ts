import { Injectable } from '@angular/core';
import * as $ from 'jquery';
import { FlightSession } from '../flight-session/flight-session';
import { Drone } from '../drone-data/drone/drone';
import { DroneState } from '../drone-data/drone/drone-state.enum';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})


export class FlightSessionController {
  private pastSessions: Map< string, FlightSession[] >;
  private activeSessions: Map< string, FlightSession>;
  private numActiveSessions: number;

  constructor( private storage: Storage) {
    this.activeSessions = new Map<string, FlightSession>();
    this.pastSessions = new Map<string , FlightSession[]> ();
    this.storage.forEach( (value, key, index ) => {
      if ( key.endsWith('_sessions')) {
        console.log(value);
        const droneId = key.replace('_sessions', '');
        const tempSessionsArr = [];
        value.forEach( (currentSession) => {
          const tempSession = new FlightSession();
          tempSession.setSesssion(currentSession);
          tempSessionsArr.push(tempSession);
        });
        this.pastSessions.set(droneId, tempSessionsArr);
      }

    });


  }

  getCurrentSession(uuid) {
    if (this.activeSessions.get(uuid) !== undefined) {
      return this.activeSessions.get(uuid);
    }
    return null;
  }

  getAllActiveSessions() {
    return Array.from( this.activeSessions.values());
  }
  getAllSessions() {
    const activeSessions = this.getAllActiveSessions();
    const previousSessions  = this.getAllPastSessions();
    if ( Array.isArray(activeSessions) && activeSessions.length  ) {
      if (Array.isArray( previousSessions) && previousSessions.length) {
        return activeSessions.concat(previousSessions);
      }
      return activeSessions;
    } else if ( Array.isArray(previousSessions) && previousSessions.length ) {
      return previousSessions;
    }
    return [];
  }

  getPastSessions(uuid) {
    return this.pastSessions.get(uuid);
  }
  getAllPastSessions() {
    const allPastSessions = Array() ;
    this.pastSessions.forEach((sessions: FlightSession[], droneId: string) => {
      allPastSessions.push(sessions);
    });
    return allPastSessions[0];

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

    console.log( this.pastSessions.get( drone.id));
    this.storage.set(drone.id + '_sessions', this.pastSessions.get(drone.id));

    drone.disArm();
    drone.setDroneState( DroneState.CONNECTED);
    this.activeSessions.get(drone.id).active = false;
    this.activeSessions.delete(drone.id);
  }


  detection(drone, data) {
    // TODO: Maybe Convert to httpsDroneService
    console.log('Fetch image');
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
