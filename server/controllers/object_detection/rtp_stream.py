import os, shlex, time
import subprocess

from .detection_strategy import DetectionStrategy
class RtpStream(DetectionStrategy):
    def __init__(self):
        super()
        
    def startDetection(self):
        super().fileStructureMaintainence()

        darknet = shlex.split('./darknet detector demo cfg/animals.data cfg/animals-tiny.cfg backup/animals-tiny_last.weights udp://127.0.0.1:5123 -thresh 0.7 -json_port 42069 -prefix ../../detections/' + self.session_time + '/img -out_filename ../../output.mkv')# -dont_show')

        self.darknet_command = subprocess.Popen(
            darknet,
            cwd='../object-recognition/src/darknet_/',
            stderr=subprocess.PIPE,
            stdout=subprocess.DEVNULL
        )

        armed = False

        for line in iter(self.darknet_command.stderr.readline, b''):
            if b'Done!\n' == line:
                armed = True
                self.darknet_command.stderr.close()
                break

        return armed
