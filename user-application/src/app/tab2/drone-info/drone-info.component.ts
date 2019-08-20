import { Component, OnInit } from '@angular/core';
import { DroneInfoState } from './drone-info-state.enum';
import * as $ from 'jquery';
import { Drone } from '../../services/drone-data/drone/drone';
import { ActivatedRoute } from '@angular/router';
import { DroneDataService} from '../../services/drone-data/drone-data.service';
import { Router } from '@angular/router';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';

@Component({
  selector: 'app-drone-info',
  templateUrl: './drone-info.component.html',
  styleUrls: ['./drone-info.component.scss'],
})
export class DroneInfoComponent implements OnInit {
  state: DroneInfoState;
  protected drone: Drone;

  constructor(  private router: Router,
                private route: ActivatedRoute,
                private dronesData: DroneDataService
  ) {

    if ( route.snapshot.routeConfig.path !== 'new-drone' ) {
      this.drone = dronesData.getDrone(route.snapshot.paramMap.get('drone'));
      console.log(this.drone);
      this.state = DroneInfoState.EDIT;
    } else {
      this.state = DroneInfoState.ADD_NEW;
    }
  }

  submitDroneInfo(): void {
    if (this.state === DroneInfoState.ADD_NEW) {
      console.log('Add new');
      const name = this.getValue('drone-name');
      const port = this.getValue('drone-port');
      const ipAddress = this.getValue('drone-ipAddress');
      const comment = '';
      this.dronesData.addNewDrone(new Drone('50', name, port, ipAddress, './assets/drone-icons/drone-1.svg', comment  ));

      this.router.navigate(['/tabs/tab2/']);
    } else if ( this.state === DroneInfoState.EDIT) {
      // TODO: Check if drone is in active session. If it is the user can't edit the information
      console.log('Edit!');
      const newName = this.getValue('drone-name');
      const newPort = this.getValue('drone-port');
      const newIpAddress = this.getValue('drone-ipAddress');
      const newComment = '';
      this.drone.updateDrone(newName, newPort, newIpAddress, newComment );
      this.router.navigate(['/tabs/tab2/']);
    }

  }
  cancel() {
    // TODO: Prompt user
    this.router.navigate(['/tabs/tab2/']);
  }
  getValue(el) {
    return  $(`#${el} input`)[0].value;
  }

  setState( state ) {
    this.state = state;
  }

  getName() {
    if (this.isEdit()) {
      return this.drone.name;
    }
    return '';
  }
  getPort() {
    if (this.isEdit()) {
      return this.drone.port;
    }
    return '';
  }

  getIpAddress() {
    if (this.isEdit()) {
      return this.drone.ipAddress;
    }
    return '';
  }
  getComments() {
    if (this.isEdit()) {
      return 'comment';
    }
    return '';
  }

  isEdit() {
    if (this.state === DroneInfoState.EDIT) {
      return true;
    }
    return false;
  }



  ngOnInit() {}

}
