from abc import ABC, abstractmethod

import os, time
import shlex

class DetectionStrategy(ABC):
    def __init__(self):
        pass
    @abstractmethod
    def startDetection(self):
        pass
    @abstractmethod
    def stopDetection(self):
        pass
    def fileStructureMaintainence(self):
        self.session_time = time.strftime('%d%h%Y')
        try:
            os.chdir('../object-recognition/src/darknet_/')
            os.mkdir('../../detections/' + self.session_time) # Same as mkdir -p
        except:
            pass
        print('return')

    def getSessionTime(self):
        return self.session_time


