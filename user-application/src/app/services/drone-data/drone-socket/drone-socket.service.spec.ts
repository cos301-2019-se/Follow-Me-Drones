import { TestBed } from '@angular/core/testing';

import { DroneSocketService } from './drone-socket.service';

describe('DroneSocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DroneSocketService = TestBed.get(DroneSocketService);
    expect(service).toBeTruthy();
  });
});
