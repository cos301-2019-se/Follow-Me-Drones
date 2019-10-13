# from system_state import SystemState
from flask_socketio import ConnectionRefusedError
from exceptions.connection_exceptions import DroneConnectionError


class SystemController():
    def __init__(self, state):
        self.state = state
        self.currentConnections = 0

    def connectDrone(self):
        if self.lessThanOneClientConnected():
            self.currentConnections += 1
            self.state.connectDrone()
        else:
            raise DroneConnectionError('Only one client is allowed to connect!')

    def armDrone(self):
        try:
            self.state.armDrone()
        except Exception:
            pass
    def disarmDrone(self):
        self.state.disarmDrone()

    def disconnectDrone(self):
       self.state.disconnectDrone()
       self.currentConnections -= 1

    def lessThanOneClientConnected(self):
        if(self.currentConnections < 1):
            return True
        else:
            return False
    def getSessionTime(self):
        return self.state.getSessionTime()


