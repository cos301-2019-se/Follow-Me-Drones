#imprt Abstract Base Class to make class abstract
from abc import ABC, abstractmethod

class SystemState(ABC):
    def __init__(self):
        print('SystemState Created!')
    @abstractmethod
    def connectDrone(self):
        pass

    @abstractmethod
    def disconnectDrone(self):
        pass

