import { Drone } from './drone';
import { DroneData } from '../../../data-models/drone-data.model';

describe('Drone', () => {
  it('should create an instance', () => {
    expect(new Drone(new DroneData('Brendon PC', 6969, '192.168.1.28', './assets/drone-icons/drone-1.svg', ''))).toBeTruthy();
  });
});
