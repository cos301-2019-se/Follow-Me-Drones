import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDronePage } from './add-new-drone.page';

import { ModalController } from '@ionic/angular';
import { AngularDelegate } from '@ionic/angular';

describe('AddNewDronePage', () => {
  let component: AddNewDronePage;
  let fixture: ComponentFixture<AddNewDronePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewDronePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [ModalController, AngularDelegate],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewDronePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
