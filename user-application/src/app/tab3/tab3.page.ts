import { Component } from '@angular/core';
import { SegmentStatus } from './segment-status.enum';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  segmentValue: SegmentStatus;
  constructor() {
    this.segmentValue = SegmentStatus.ALL;
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

}
