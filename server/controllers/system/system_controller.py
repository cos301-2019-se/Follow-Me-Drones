# from system_state import SystemState

class SystemController():
    def __init__(self, state):
        self.state = state

    def connectDrone(self):
        self.state.connectDrone()

    def disconnectDrone(self):
        self.state.disconnectDrone()


