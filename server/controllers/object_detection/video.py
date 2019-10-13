from .detection_strategy import DetectionStrategy
import os, shlex, time
import subprocess

class Video(DetectionStrategy):
    def __init__(self, video="african-botswana.mp4", weights='animals-tiny_last.weights'):
        super()
        self.video = video
        self.weights = weights

    def startDetection(self):
        print('Starting video detection')
        super().fileStructureMaintainence()
        darknet = shlex.split('./darknet detector demo cfg/animals.data cfg/animals-tiny.cfg backup/animals-tiny_last.weights data/videos/' + self.video   + ' -thresh 0.85 -json_port 42069 -prefix ../../detections/' + self.session_time + '/img -out_filename ../../output.mkv')# -dont_show')

        self.darknet_command = subprocess.Popen(darknet, cwd='../object-recognition/src/darknet_/', stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
        
        for line in iter(self.darknet_command.stderr.readline, b''):
            if b'Done!' in line:
                print('Done!')
                print('Drone is armed! Beware poachers')
                detection_armed = True
                self.darknet_command.stderr.close()
                break
