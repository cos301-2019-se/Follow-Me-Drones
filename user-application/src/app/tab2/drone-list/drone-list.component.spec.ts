import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneListComponent } from './drone-list.component';

describe('DroneListComponent', () => {
  let component: DroneListComponent;
  let fixture: ComponentFixture<DroneListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DroneListComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DroneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
