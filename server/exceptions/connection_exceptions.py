class ConnectionError(Exception):
    def defualtError(self):
        print('A ConnectionError has ocurred')
        self.printLines()

    def printLines(self):
        print('=================================')

class DroneConnectionError(ConnectionError):
    def __init__(self, err):
        self.strerror = err
        self.args = {err}
    def getMessage(self):
        # super().defualtError()
        return self.strerror

class IncorrectNetwork(Exception):
    def __init__(self, err):
        self.strerror = err
        self.args = {err}
    def getMessage(self):
        return self.strerror
