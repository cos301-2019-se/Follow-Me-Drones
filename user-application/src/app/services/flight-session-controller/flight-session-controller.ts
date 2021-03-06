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
  getSessionByUUID(uuid): FlightSession {
    const allSessions = this.getAllSessions();
    console.log('getting them all');
    console.log(allSessions);
    const session = allSessions.filter( sesh => sesh.sessionID === uuid);
    return session[0];
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
      sessions.forEach(( session: FlightSession ) => {
        allPastSessions.push(session);
      }) ;
    });
    console.log(allPastSessions);
    return allPastSessions;

  }

  startFlightSession(drone, sessionName) {

    if ( drone.getState() === DroneState.ARMED) {
      return false;
    }

    drone.armDrone();
    drone.setDroneState( DroneState.ARMING );
    const newFlightSession = new FlightSession();
    newFlightSession.droneName = drone.name;
    newFlightSession.sessionName = sessionName;
    console.log('creating new session and setting name');
    this.activeSessions.set( drone.id, newFlightSession);
    return true;

  }

  endFlightSession(drone) {

    const oldPastSessions = this.pastSessions.get(drone.id);
    if ( oldPastSessions !== undefined ) {
      const sesh = this.activeSessions.get(drone.id);
      const updatedPastSessions = oldPastSessions.concat(sesh);
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
  getActiveSessionFor(id) {
    return this.activeSessions.get(id);
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
  deleteSession(session) {
    this.storage.forEach( (value, key, index ) => {
      if ( key.endsWith('_sessions')) {
        const droneId = key.replace('_sessions', '');
        const tempSessionsArr = [];
        value.forEach( (currentSession) => {
          const tempSession = new FlightSession();
          if ( currentSession.sessionID === session.sessionID) {
            console.log('match');
            console.log(currentSession);
            // const arr  = this.pastSessions.get(droneId)
            const arr  = this.pastSessions.get(droneId).filter( sesh => sesh.sessionID !== currentSession.sessionID);
            this.pastSessions.delete(droneId);
            this.pastSessions.set(droneId, arr);
            this.storage.set(droneId + '_sessions', arr);
            console.log(arr);
          }
          // tempSession.setSesssion(currentSession);
          // tempSessionsArr.push(tempSession);
        });
        // this.pastSessions.set(droneId, tempSessionsArr);
      }

    });
  }

}
