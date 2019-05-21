import { Component, OnInit } from '@angular/core';
import { DroneData } from '../../../data-models/drone-data.model';

@Component({
  selector: 'app-drone-list',
  templateUrl: './drone-list.component.html',
  styleUrls: ['./drone-list.component.scss'],
})
export class DroneListComponent implements OnInit {

  private droneList: DroneData[] = [];
  isValid: boolean;

  constructor() {
    this.generateListDynamically();
    this.isValid = false;
  }

  ngOnInit() {

  }

  generateListDynamically() {
    this.droneList.push( new DroneData('DJI Mavic Pro', 2000, '10.0.0.1', './assets/drone-icons/drone-1.svg', ''));
    this.droneList.push( new DroneData('DJI Mavic Air', 3000, '10.0.0.2', './assets/drone-icons/drone-2.svg', ''));
    this.droneList.push( new DroneData('DJI Spark', 4000, '10.0.0.3', './assets/drone-icons/drone-3.svg', ''));

    let tempDrone = new DroneData('DJI Inspire 2', 5000, '10.0.0.4', 'assets/drone-icons/drone-4.svg', '');
    tempDrone.setConnected(true);

    this.droneList.push(tempDrone);


  }

  connectDrone(event) {
    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    this.droneList[index].setConnected(true);
  }

  disconnectDrone(event) {
    // TODO: Add prompt to ask if sure to disconnect

    let currentNode = event.target;

    while ((currentNode.getAttribute('data-index') === null)) {
      currentNode = currentNode.parentNode;
    }

    const index = currentNode.getAttribute('data-index');
    this.droneList[index].setConnected(false);
  }

}
