import { Component, OnInit } from '@angular/core';
import { DroneInfoState } from './drone-info-state.enum';
import * as $ from 'jquery';
import { Drone } from '../../services/drone-data/drone/drone';
import { ActivatedRoute } from '@angular/router';
import { DroneDataService} from '../../services/drone-data/drone-data.service';
import { Router } from '@angular/router';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { UUID } from 'angular2-uuid';
import {Validators, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DroneState } from '../../services/drone-data/drone/drone-state.enum';

@Component({
  selector: 'app-drone-info',
  templateUrl: './drone-info.component.html',
  styleUrls: ['./drone-info.component.scss'],
})
export class DroneInfoComponent implements OnInit {
  state: DroneInfoState;
  protected drone: Drone;
  public droneForm : FormGroup;

  constructor(  
                private router: Router,
                private route: ActivatedRoute,
                private dronesData: DroneDataService,
                private formBuilder : FormBuilder
  ) {

    this.droneForm = this.formBuilder.group({
      droneName: ['', Validators.required],
      droneIP: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)$'),
      ])],
      dronePort: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$'),
      ])],
      droneComments: ['', Validators.maxLength(256)],
    });

    if ( route.snapshot.routeConfig.path !== 'new-drone' ) {
      this.drone = dronesData.getDrone(route.snapshot.paramMap.get('drone'));
      this.state = DroneInfoState.EDIT;
      this.droneForm.controls['droneName'].setValue(this.drone.name);
      this.droneForm.controls['dronePort'].setValue(this.drone.port);
      this.droneForm.controls['droneIP'].setValue(this.drone.ipAddress);
      this.droneForm.controls['droneComments'].setValue(this.drone.comment);
    } else {
      this.state = DroneInfoState.ADD_NEW;
    }
  }

  submitDroneInfo(): void {
    if (this.state === DroneInfoState.ADD_NEW) {
      const name = this.droneForm.value['droneName'];
      const port = this.droneForm.value['dronePort'];
      const droneIP = this.droneForm.value['droneIP'];
      const comment = this.droneForm.value['droneComments'];
      const tempDrone = new  Drone( UUID.UUID() , name, port, droneIP, './assets/drone-icons/drone-1.svg', comment  );
      tempDrone.serverOnline( (online) => {
        if (online) {
          tempDrone.setDroneState(DroneState.ONLINE);
        } else {
          tempDrone.setDroneState(DroneState.OFFLINE);
        }
      });

      this.dronesData.addNewDrone(tempDrone);

      this.router.navigate(['/tabs/tab2/']);
    } else if ( this.state === DroneInfoState.EDIT) {
      // TODO: Check if drone is in active session. If it is the user can't edit the information
      const newName = this.droneForm.value['droneName'];
      const newPort = this.droneForm.value['dronePort'];
      const newIpAddress = this.droneForm.value['droneIP'];
      const newComment = this.droneForm.value['droneComments'];
      this.drone.updateDrone(newName, newPort, newIpAddress, newComment );
      this.dronesData.updateDrone(this.drone);
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
      return this.droneForm.value['droneName'];
    }
    return '';
  }
  getPort() {
    if (this.isEdit()) {
      return this.droneForm.value['dronePort'];
    }
    return '';
  }

  getIpAddress() {
    if (this.isEdit()) {
      return this.droneForm.value['droneIP'];
    }
    return '';
  }
  getComments() {
    if (this.isEdit()) {
      return this.droneForm.value['droneComments'];
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
