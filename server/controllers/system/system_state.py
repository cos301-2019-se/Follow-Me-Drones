#imprt Abstract Base Class to make class abstract
from abc import ABC, abstractmethod

class SystemState(ABC):
    def __init__(self):
        print('SystemState Created!')

    def setDetectionStrategy(self, strategy):
        self.objectDetectionStrategy = strategy

    @abstractmethod
    def connectDrone(self):
        pass

    @abstractmethod
    def disconnectDrone(self):
        pass
    def getSessionTime(self):
        return self.objectDetectionStrategy.getSessionTime()

