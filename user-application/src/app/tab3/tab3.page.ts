import { Component } from '@angular/core';
import { SegmentStatus } from './segment-status.enum';
import { DroneDataService } from '../services/drone-data/drone-data.service';
import { Drone } from '../services/drone-data/drone/drone';
import { FlightSession } from '../services/flight-session/flight-session';
import { FlightSessionController } from '../services/flight-session-controller/flight-session-controller';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  segmentValue: SegmentStatus;
  private drones: Drone[] = [];
  private filteredDrones: Drone[] = [];

  private sessions: FlightSession[];

  constructor(
    private dronesData: DroneDataService,
    private flightSessionController: FlightSessionController
  ) {
    this.segmentValue = SegmentStatus.ALL;
    this.drones = this.dronesData.getDrones();
    this.filteredDrones = this.dronesData.getDrones();
    this.sessions = this.flightSessionController.getAllSessions();
    this.filterSessions('all-drones');
  }
  setAll() {
    this.sessions = this.flightSessionController.getAllSessions();
    this.segmentValue = SegmentStatus.ALL;
  }
  setPrevious() {
    this.sessions = this.flightSessionController.getAllSessions();
    this.segmentValue = SegmentStatus.PREVIOUS;
    // this.sessions = this.flightSessionController.getAllPastSessions();
  }
  setActive() {
    this.sessions = this.flightSessionController.getAllSessions();
    this.segmentValue = SegmentStatus.ACTIVE;
  }

  isAll() {
    return this.segmentValue === SegmentStatus.ALL ? true : false;
  }
  isActive() {
    return this.segmentValue === SegmentStatus.ACTIVE ? true : false;
  }
  isPrevious() {
    return this.segmentValue === SegmentStatus.PREVIOUS ? true : false;
  }

  filterSessions(value) {
    this.sessions = this.flightSessionController.getAllSessions();
    this.filteredDrones = this.dronesData.getDrones();

    if (value === 'all-drones') {
      this.filteredDrones = this.drones;
      console.log(this.filteredDrones);
    } else {
      const filteredSessions = this.sessions.filter(session => session.droneName === value);
      this.sessions = filteredSessions;
      // this.flightSession. = this.filteredDrones;
      // this.filteredDrones = this.drones;
      // this.filteredDrones = this.filteredDrones.filter(drone => drone.name === value);
      // // this.flightSession. = this.filteredDrones;
      // console.log(this.filteredDrones);
    }
  }

  onContextChange(value) {
    this.filterSessions(value);
  }

}
