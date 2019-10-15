# from system_state import SystemState
from flask_socketio import ConnectionRefusedError
from exceptions.connection_exceptions import DroneConnectionError

class SystemController():
    def __init__(self, state):
        self.state = state
        self.currentConnections = 0
        self.isArmed = False

    def connectDrone(self):
        if self.lessThanOneClientConnected():
            self.currentConnections += 1
            self.state.connectDrone()
        else:
            raise DroneConnectionError('Only one client is allowed to connect!')

    def armDrone(self):
        print('Starting drone detection...')
        try:
            if self.state.armDrone():
                self.isArmed = True
                print('Done starting detection!')
            else:
                print('Failed starting detection!')

        except Exception:
            print('Failed!')
            
    def disarmDrone(self):
        if self.isArmed:
            print('Disarming drone...')
            self.state.disarmDrone()
            print('Done disarming!')

            self.isArmed = False

    def disconnectDrone(self):
        self.disarmDrone()

        self.state.disconnectDrone()
        self.currentConnections -= 1

    def lessThanOneClientConnected(self):
        if(self.currentConnections < 1):
            return True
        else:
            return False
            
    def getSessionTime(self):
        return self.state.getSessionTime()


