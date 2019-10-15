from .system_state import SystemState
from ..object_detection.video import Video
from ..object_detection.webcam import Webcam
class NoDrone(SystemState):
    def __init__(self, strategy=Webcam()):
        print('Starting without drone')
        self.setDetectionStrategy( strategy )

    def connectDrone(self):
        print('The client is attempting to connect. The system will run without the drone!')

    def disconnectDrone(self):
        pass

    def armDrone(self):
        print('\nArming with no drone...')
        try:
            return self.objectDetectionStrategy.startDetection()
        except:
            print('Something went wrong arming the drone')
            
        return False
        
    def disarmDrone(self):
        self.objectDetectionStrategy.stopDetection()
