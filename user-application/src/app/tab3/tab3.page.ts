import { Component } from '@angular/core';
import { SegmentStatus } from './segment-status.enum';
import { DroneDataService } from '../services/drone-data/drone-data.service';
import { Drone } from '../services/drone-data/drone/drone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  segmentValue: SegmentStatus;
  private drones: Drone[] = [];
  private filteredDrones: Drone[] = [];
  constructor(
    private dronesData: DroneDataService,
  ) {
    this.segmentValue = SegmentStatus.ALL;
    this.drones = this.dronesData.getDrones();
    this.filteredDrones = this.dronesData.getDrones();
  }
  setAll() {
    this.segmentValue = SegmentStatus.ALL;
  }
  setPrevious() {
    this.segmentValue = SegmentStatus.PREVIOUS;
  }
  setActive() {
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

  onContextChange(value) {
    // console.log(value);
    this.filteredDrones = this.dronesData.getDrones();
    if (value == 'all-drones') {
      this.filteredDrones = this.drones;
      console.log(this.filteredDrones);
    }
    else {
      this.filteredDrones = this.drones;
      this.filteredDrones = this.filteredDrones.filter(drone => drone.name === value);
      // this.flightSession. = this.filteredDrones;
      console.log(this.filteredDrones);
    }
  }

}
