from .system_state import SystemState
from ..object_detection.video import Video
from ..object_detection.webcam import Webcam
class NoDrone(SystemState):
    def __init__(self, strategy=Webcam()):
        print('Starting without drone')
        self.setDetectionStrategy( strategy )
    def connectDrone(self):
        print('The client is attempting to connect. The system will run without the drone!')
        pass
    def disconnectDrone(self):
        pass
    def armDrone(self):
        print('Arming with no Drone')
        try:
            self.objectDetectionStrategy.startDetection()
        except:
            # There was a problem starting detection
            pass
    def disarmDrone(self):
        self.objectDetectionStrategy.stopDetection()
