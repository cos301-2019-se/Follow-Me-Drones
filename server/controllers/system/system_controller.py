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
            try:
                self.state.connectDrone()
            except Exception:
                raise DroneConnectionError('Failed to connect to physical drone!')
        else:
            # more than one user atempted to connect
            raise DroneConnectionError('Only one client is allowed!')

    def disconnectDrone(self):
       self.state.disconnectDrone()

    def lessThanOneClientConnected(self):
        if(self.currentConnections < 1):
            return True
        else:
            return False


