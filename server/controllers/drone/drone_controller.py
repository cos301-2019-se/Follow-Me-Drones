from .drone import Drone

class DroneController():
    def __init__(self):
        self.bebop = Drone()
        print('init drone controller')
    def connectDrone(self):
        self.bebop.connect()
