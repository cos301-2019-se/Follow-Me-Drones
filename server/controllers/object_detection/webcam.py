from .detection_strategy import DetectionStrategy
import os, shlex, time
import subprocess
from  classes.darknet_config import DarknetConfig

animals = DarknetConfig(weights='animals-tiny_last.weights', cfg='animals-tiny.cfg', data='animals.data', camera_id=0)

class Webcam(DetectionStrategy):
    def __init__(self, config=animals):
        super()
        self.config = config

    def startDetection(self):
        super().fileStructureMaintainence()

        darknet = shlex.split('./darknet detector demo ' + self.config.data + ' ' + self.config.cfg + ' ' +  self.config.weights + '  -c '  + self.config.camera_id   + ' -thresh 0.85 -json_port 42069 -prefix ../../detections/' + self.session_time + '/img -out_filename ../../output.mkv')# -dont_show')

        self.darknet_command = subprocess.Popen(darknet, cwd='../object-recognition/src/darknet_/', stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)

        armed = False

        for line in iter(self.darknet_command.stderr.readline, b''):
            if b'Done!\n' == line:
                armed = True
                self.darknet_command.stderr.close()
                break

        return armed
