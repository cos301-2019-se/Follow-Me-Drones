from .detection_strategy import DetectionStrategy
import os, shlex, time
import subprocess
class Webcam(DetectionStrategy):
    def __init__(self, camera_id=0):
        super()
        self.camera_id = camera_id
        
    def startDetection(self):
        super().fileStructureMaintainence()

        darknet = shlex.split('./darknet detector demo cfg/animals.data cfg/animals-tiny.cfg backup/animals-tiny_last.weights -c '  + str(self.camera_id)   + ' -thresh 0.85 -json_port 42069 -prefix ../../detections/' + self.session_time + '/img -out_filename ../../output.mkv')# -dont_show')

        self.darknet_command = subprocess.Popen(darknet, cwd='../object-recognition/src/darknet_/', stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
        
        armed = False

        for line in iter(self.darknet_command.stderr.readline, b''):
            if b'Done!\n' == line:
                armed = True
                self.darknet_command.stderr.close()
                break

        return armed