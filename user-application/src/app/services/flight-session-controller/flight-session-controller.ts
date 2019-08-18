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
      this.numActiveSessions++;
      this.activeSession = new FlightSession();
      this.drone.armDrone();
      this.drone.setDroneState(DroneState.ARMING);
      return true;
    } else {
      return false;
    }
  }

  endFlightSession() {
    this.active = false;
    this.pastSessions.set(this.drone.getName(), this.activeSession);
    this.drone.disArm();
  }

  isActive() {
    return this.active;
  }

  addImage(image) {
    this.activeSession.addImage(image);
  }
  getImage() {
    console.log('hey');
    this.activeSession = new FlightSession();
    return this.activeSession.getImage(2);
  }

  getCurrentFlightSession() {
    return this.activeSession;
  }


}
