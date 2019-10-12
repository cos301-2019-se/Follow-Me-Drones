from .system_state import SystemState
class NoDrone(SystemState):
    def __init__(self):
        print('Starting without drone')
        pass
    def connectDrone(self):
        pass
    def disconnectDrone(self):
        pass

