from .system_state import SystemState
from exceptions.connection_exceptions import IncorrectNetwork
from ..drone.drone_controller import DroneController
from ..object_detection.rtp_stream import RtpStream

import subprocess

class WithDrone(SystemState):
    def __init__(self):
        print('Starting with Drone')
        self.drone_controller = DroneController()
        self.setDetectionStrategy( RtpStream() )

    def connectDrone(self):
        print('The client is attempting to connect. The system will run with the drone!')
        print('Connecting to d')
        if self.correctNetwork():
            self.drone_controller.connect()

        else:
            raise IncorrectNetwork('Please connect to the ParrotBebop2 network')
            
    def disconnectDrone(self):
        self.drone_controller.disconnect()

    def armDrone(self):
        print('Arming parrot!')
        armed = self.strategy.startDetection()

        if armed:
            self.drone_controller.arm()

    def correctNetwork(self):
        try:
            output = subprocess.Popen('nmcli | grep ParrotBebop2', shell=True, stdout=subprocess.PIPE).stdout.read()
        except Exception:
            print('please install nmcli')
        if len(output) > 5:
            return True
        else:
            return False


