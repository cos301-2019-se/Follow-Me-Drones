class ObjectDetector():
    def __init__(self, strategy):
        self.strategy = strategy
        
    def startDetection(self):
        self.strategy.startDetection()
    
    def stopDetection(self):
        print('Turning off object detection...', end='')
        self.darknet_command.kill()
        print('Done!')