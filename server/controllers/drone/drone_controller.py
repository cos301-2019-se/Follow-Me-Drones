from .drone import Drone

import time

class DroneController():
    def __init__(self):
        self.bebop = Drone()
        self.droneConnected = False
        self.droneArmed = False

        self.ffmpegRefreshTime = 12

    def connect(self):
        if not self.droneConnected:
            status = self.bebop.connect(liveStream = False)
            self.droneConnected = status

        return self.droneConnected

    def disconnect(self):
        if self.droneConnected:
            self.disarm()

            if self.bebop.getFlyingState() != 'landed' and self.bebop.getFlyingState() != 'uninitialized':
                self.bebop.goHome()
                self.bebop.land()

            self.bebop.disconnect()

            self.droneConnected = False

    # function to do the following:
    #   - start drone stream
    #   - start ffmpeg restream to udp://127.0.0.1:5123
    #   - maintain the ffmpeg stream
    def arm(self):
        if not self.droneArmed:
            print('arming drone')
            # Start video stream
            self.bebop.startVideoStream()

            # Hackerman
            time.sleep(1)

            # Start ffmpeg restream
            self.bebop.startFfmpegRestream('udp://127.0.0.1:5123')

            # Maintain ffmpeg restream
            self.bebop.maintainFfmpegRestream(self.ffmpegRefreshTime)

            # Launch drone and go up by X meters
            # print('Taking off...', end='', flush=True)
            # self.bebop.launch(2.0) 
            # print('Done!')

            self.droneArmed = True

    def disarm(self):
        if self.droneArmed:
            # Drone go home
            # print('Drone returning home...', end='', flush=True)
            # self.bebop.goHome() 
            # print('Done!')

            # Land drone
            # print('Landing drone...', end='', flush=True)
            # self.bebop.land() 
            # print('Done!')

            # Stop ffmpeg maintenance
            self.bebop.stopFfmpegMaintenance()

            # Stop restream
            self.bebop.stopFfmpegRestream()

            # Stop video stream
            self.bebop.stopVideoStream()
            
            self.droneArmed = False
