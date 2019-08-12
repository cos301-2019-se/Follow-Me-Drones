import { FlightSession } from '../flight-session/flight-session';
import { Drone } from '../drone/drone';
import { DroneState } from '../drone/drone-state.enum';


export class FlightSessionController {
  private activeSession: FlightSession;
  private pastSessions: Map< string, FlightSession>;
  private drone: Drone;
  private active: boolean;


  private numActiveSessions: number;

  constructor(drone) {
    this.drone = drone;
    this.active = false;
    this.pastSessions = new Map<string, FlightSession>();
  }

  startSession() {
    if (!this.active) {
      this.active = true;
      console.log('Creating flight session');
      this.numActiveSessions++;
      this.activeSession = new FlightSession();
      this.drone.armDrone();
      this.drone.setDroneState(DroneState.ARMING);
      return true;
    } else {
      return false;
    }
  }

  endSession() {
    this.active = false;
    this.pastSessions.set(this.drone.getName(), this.activeSession);
  }

  isActive() {
    return this.active;
  }

  getCurrentFlightSession() {
    return this.activeSession;
  }


}
