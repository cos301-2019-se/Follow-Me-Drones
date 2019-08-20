import { Drone } from './drone';

describe('Drone', () => {
  it('should create an instance', () => {
    expect(new Drone(' uuid ', 'Brendon PC', 6969, '192.168.1.28', './assets/drone-icons/drone-1.svg', '')).toBeTruthy();
  });
});
