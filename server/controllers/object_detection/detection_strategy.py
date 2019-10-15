from abc import ABC, abstractmethod

import os, time
import shlex

class DetectionStrategy(ABC):
    def __init__(self):
        self.darknet_command = None
        self.session_time = None

    @abstractmethod
    def startDetection(self):
        pass

    def stopDetection(self):
        if self.darknet_command:
            self.darknet_command.kill()
        
    def fileStructureMaintainence(self):
        self.session_time = time.strftime('%d%h%Y')
        try:
            os.mkdir('../object-recognition/detections/' + self.session_time) # Same as mkdir -p
        except:
            pass

    def getSessionTime(self):
        return self.session_time