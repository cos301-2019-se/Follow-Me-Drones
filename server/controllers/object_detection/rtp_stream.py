import os, shlex, time
import subprocess

from detection_strategy import DetectionStrategy
class RtpStream(DetectionStrategy):
    def __init__(self):
        pass
    def startDetection(self):
        print('Starting rtp_stream detection')
        super().fileStructureMaintainence() 
        darknet = shlex.split('./darknet detector demo cfg/animals.data cfg/animals-tiny.cfg backup/animals-tiny_last.weights udp://127.0.0.1:5123 -thresh 0.7 -json_port 42069 -prefix ../../detections/' + self.session_time + '/img -out_filename ../../output.mkv')# -dont_show')

        self.darknet_command = subprocess.Popen(darknet, cwd=os.getcwd(), stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
        
        for line in iter(self.darknet_command.stderr.readline, b''):
            if b'Done!' in line:
                print('Done!')
                print('Drone is armed! Beware poachers')
                detection_armed = True
                self.darknet_command.stderr.close()
                break

    def stopDetection(self):
        print('Turning off object detection...', end='')
        self.darknet_command.kill()
        print('Done!')
