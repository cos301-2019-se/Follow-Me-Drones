from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, ConnectionRefusedError
from flask_cors import CORS

import subprocess
import os
import glob
import base64
import time

# Drone stuff
from pyparrot.Bebop import Bebop
from pyparrot.DroneVision import DroneVision
# import threading

_bebop = Bebop()

# Port for the server
_port = 42069
_host = '0.0.0.0'

# Flask app
app = Flask(__name__)
CORS(app)

# ============================================================================
#                           Socket for the app
# ============================================================================
_currentConnections = 0
_runningCommand = False

# Create the socket, with all origins allowed

io = SocketIO(app, cors_allowed_origins="*", monitor_clients=True)

# Connection event
@io.on('connect')
def test_connect():
    global _currentConnections

    # Only allow one app to be connected at any given time
    if _currentConnections >= 1:
        # print('\nToo many apps attempted to connect to drone, kicked', request.sid)
        # print('Current connections ->', _currentConnections, '\n')

        raise ConnectionRefusedError('Unauthorized!')
    else:
        _currentConnections += 1
        print('\nApp connected with ID', request.sid)
        print('Current connections ->', _currentConnections, '\n')

        # Establish connection to drone
        success = _bebop.connect(5)

        if not success:
            emit('error')

# Connection event
@io.on('connect_drone')
def test_connect():
    emit('connect_success')

# Disconnection event
@io.on('disconnect')
def disconnect():
    global _currentConnections
    global _runningCommand

    _currentConnections -= 1
    print('App disconnected with ID', request.sid)
    print('Current connections ->', _currentConnections)

    # If the detection is running and the app disconnects, turn it off
    if _runningCommand:
        print('Turning off object detection...')
        _runningCommand.kill()
        _runningCommand = False

# Arming event
@io.on('arm_drone')
def arm():
    global _runningCommand

    print('Establishing video stream with drone...', end='')
    _bebop.start_video_stream()

    print('Done!')

    print('Starting object recognition...')

    # Move into the darknet directory
    os.chdir('../object-recognition/src/darknet_/')

    # Video camera
    # ./darknet detector demo cfg/animals.data cfg/animals.cfg backup/animals_last.weights -c 2 -thresh 0.7 -json_port 42069 -prefix ../../detections/img -out_filename ../../output.mkv
    # _cmd = ['./darknet', 'detector', 'demo', 'cfg/animals.data', 'cfg/animals.cfg', 'backup/animals_last.weights', '-c', '2', '-thresh', '0.7', '-json_port', '42069', '-out_filename', '../../output.mkv', '-prefix', '../../detections/img']
    
    # Video stream
    # ./darknet detector demo cfg/animals.data cfg/animals.cfg backup/animals_last.weights data/videos/african-wildlife.mp4 -thresh 0.7 -json_port 42069 -prefix ../../detections/img -out_filename ../../output.mkv
    # _cmd = ['./darknet', 'detector', 'demo', 'cfg/animals.data', 'cfg/animals.cfg', 'backup/animals_last.weights', 'data/videos/african-wildlife.mp4', '-thresh', '0.7', '-json_port', '42069', '-out_filename', '../../output.mkv', '-prefix', '../../detections/img']
    
    # Drone stream
    # ./darknet detector demo cfg/animals.data cfg/animals.cfg backup/animals_last.weights data/bebop.sdp -thresh 0.7 -json_port 42069 -prefix ../../detections/img -out_filename ../../output.mkv
    _cmd = ['./darknet', 'detector', 'demo', 'cfg/animals.data', 'cfg/animals.cfg', 'backup/animals_last.weights', 'data/bebop.sdp', '-thresh', '0.7', '-json_port', '42069', '-out_filename', '../../output.mkv', '-prefix', '../../detections/img']

    _runningCommand = subprocess.Popen(_cmd, cwd=os.getcwd(), stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    # Move back into the server directory
    os.chdir('../../../server/')

    # Wait for detection to start, then alert the app
    for line in iter(_runningCommand.stderr.readline, b''):
        if b'Done!' in line:
            print('Drone is armed! Beware poachers')
            emit('drone_armed')

            _runningCommand.stderr.close()
            break

# Disarm event
@io.on('disarm_drone')
def disarm():
    global _runningCommand

    # If the detection is running and the app disconnects, turn it off
    if _runningCommand:
        print('Turning off object detection...')
        _runningCommand.kill()
        _runningCommand = False

    emit('drone_disarmed')

# Return home event
@io.on('return-home')
def ETGoHome():
    pass

# Default GET, should never happen
@app.route('/', methods=["GET"])
def index():
    return '<html><head><title>Turn back now</title></head><body><p style="color: red; width: 100%; text-align: center; margin-top: 20%">01011001011011110111010100100000011100110110100001101111011101010110110001100100011011100010011101110100001000000110001001100101001000000110100001100101011100100110010100100001</p></body></html>'

# Endpoint to ping server
@app.route('/ping', methods=["GET"])
def ping():
    return '[{"pong"}]'

# ============================================================================
#                             Handling images
# ============================================================================

# Converts the image in detections/ to base64
def convertImageToBase64(image_id):
    _img = '../object-recognition/detections/' + image_id

    with open(_img, 'rb') as img_file:
        return str(base64.b64encode(img_file.read()))

# Endpoint for the app to request an image based on an image_id
@app.route('/image', methods=['POST'])
def return_image():
    blob = convertImageToBase64(request.get_json()['image'])
    #blob = convertImageToBase64(request.jsond)
    return (jsonify(blob), 200)

# ============================================================================
#                           Handling detections
# ===== =======================================================================
 
# Function to alert the app of a detection
def alertAppOfDetection(frame_id, detection):
    _img = 'img_' + str(frame_id).zfill(8) + '.jpg'

    io.emit('detection', {'detection': detection, 'image': _img})

# Filter global variables
lastDetectedFrame = 0
previousDetections = []
newDetections = []

# Endpoint for POST requests alerting the server of a detection
@app.route('/detection', methods=['POST'])
def detection():
    # Tests:
    # Single animal -> curl -X POST -d '{"frame_id":121, "objects": [ {"class_id":1, "name":"elephant", "relative_coordinates":{"center_x":0.465886, "center_y":0.690794, "width":0.048322, "height":0.065592}, "confidence":0.704248}]}' -H 'Content-Type:application/json' http://127.0.0.1:42069/detection
    # Herd -> curl -X POST -d '{"frame_id":181, "objects": [ {"class_id":1, "name":"elephant", "relative_coordinates":{"center_x":0.465886, "center_y":0.690794, "width":0.048322, "height":0.065592}, "confidence":0.704248}, {"class_id":1, "name":"elephant", "relative_coordinates":{"center_x":0.465886, "center_y":0.690794, "width":0.048322, "height":0.065592}, "confidence":0.704248}]}' -H 'Content-Type:application/json' http://127.0.0.1:42069/detection

    #  Data received in format
    #   JSON data:
    #   {
    #      frame_id: 39,
    #      objects:
    #      [{
    #          class_id: 2,
    #          name: 'rhino',
    #          relative_coordinates: [Object],
    #          confidence: 0.854001
    #      }]
    #   }
    #

    global lastDetectedFrame
    global previousDetections
    global newDetections

    detection = request.json

    # Server will only check first detection and then each 50th frame thereafter
    if abs(detection['frame_id'] - lastDetectedFrame) > 50 or lastDetectedFrame == 0:

        # If theres been over 100 frames without a detection, erase the list of old previousDetections as the camera has probably moved long past the last animal
        if abs(detection['frame_id'] - lastDetectedFrame) > 100:
            previousDetections = []

        lastDetectedFrame = detection['frame_id']

        dX = dY = threshX = threshY = 0
        animalAlreadyDetected = False

        # Count how many of each animal are present in the frame
        animalCounters = {}
        for detectedAnimal in detection['objects']:
            if detectedAnimal['name'] in animalCounters:
                animalCounters[detectedAnimal['name']]['count'] += 1
            else:
                # Initialise the animals details, saving its name as the index, a count for how many of them there are, and its coordinates
                animalCounters[detectedAnimal['name']] = {}
                animalCounters[detectedAnimal['name']]['count'] = 1
                animalCounters[detectedAnimal['name']]['relative_coordinates'] = detectedAnimal['relative_coordinates']

        for detectedAnimal in animalCounters:

            # See if the old list of previousDetections contains the ones now detected
            animalAlreadyDetected = False

            # If there is more than 1 of this type of animal, then handle it as a herd. Else check if its the same animal as previously
            if animalCounters[detectedAnimal]['count'] > 1:
                for animal in previousDetections:
                    # If there exists a previousDetections name equal to the newly detected animal and the herd flag is set, then that animal has already been detected
                    if animal['name'] == detectedAnimal and animal['herd']:
                        animalAlreadyDetected = True
                        break

                # New detection of a herd
                if not animalAlreadyDetected:
                    print('\n', '\033[36m', 'New detection!', '\033[37m') # Blue writing
                    print('\tFrame ->', detection['frame_id'])
                    print('\tHerd of ->', detectedAnimal, '\n')

                    alertAppOfDetection(detection['frame_id'], 'herd of ' + detectedAnimal)

                # Create a new list of the currently detected animals, with herd flag set to true
                newDetections.append({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': True})
            else:
                # Check if the list of detections animalAlreadyDetected an animal with the same name, and if its position is within the threshold
                for animal in previousDetections:
                    dX = abs(animal['relative_coordinates']['center_x'] - animalCounters[detectedAnimal]['relative_coordinates']['center_x'])
                    dY = abs(animal['relative_coordinates']['center_y'] - animalCounters[detectedAnimal]['relative_coordinates']['center_y'])

                    threshX = 4*animalCounters[detectedAnimal]['relative_coordinates']['width']
                    threshY = 4*animalCounters[detectedAnimal]['relative_coordinates']['height']

                    # If names are the same, and their X and Y coords are within a range of the thresholds, then its considered the same animal
                    if animal['name'] == detectedAnimal and dX < threshX and dY < threshY:
                        animalAlreadyDetected = True

                        # Update the previousDetections center coordinates
                        animal['relative_coordinates']['center_x'] = animalCounters[detectedAnimal]['relative_coordinates']['center_x']
                        animal['relative_coordinates']['center_y'] = animalCounters[detectedAnimal]['relative_coordinates']['center_y']
                        break

                # New detection of a single animal
                if not animalAlreadyDetected:
                    print('\n', '\033[36m', 'New detection!', '\033[37m') # Blue writing
                    print('\tFrame ->', detection['frame_id'])
                    print('\tAnimal ->', detectedAnimal, '\n')

                    alertAppOfDetection(detection['frame_id'], detectedAnimal)

                # Create a new list of the currently detected animals, with the herd flag set to false
                newDetections.append({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': False})

        # Replace the old list with the new list, since the camera is always moving 'forward', you can discard any previousDetections that have fallen out of frame
        previousDetections = newDetections
        newDetections = []
    return ('', 200)

# ============================================================================
#                  Print the logo and run socket/server
# ============================================================================

def zipdir(directory, password):
    subprocess.call(['7z', 'a', '-mem=AES256', '-p' + password, '-y', time.strftime('%Y%m%d%h') + '-detections.zip', directory + '/*'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def startup_process():
    pass

def shutdown_process():
    print('Beginning shutdown process... \n')

    # Create an encrypted zip file of all the detections
    print('Encrypting all detection images... ', end='', flush=True)

    os.chdir('../object-recognition/')
    
    # Create an encrypted zip of the files
    zipdir('detections', 'Capstone69')

    print('Done!')

    # Delete all the unencrypted images
    print('Deleting all unencrypted detection images... ', end='', flush=True)

    os.chdir('detections/')

    files=glob.glob('*.jpg')
    for filename in files:
        os.remove(filename)

    print('Done!')

    os.chdir('../../server/')

    # Stop the server
    io.emit('disconnect')
    io.stop()
    print('Done... Goodbye!')

def run(p = _port, h = _host):
    # l1 = '\n\t    _/_/_/_/        _/_/_/  _/    _/  _/      _/    _/_/_/        _/      _/_/_/    _/_/_/      _/_/    _/      _/    _/_/_/  _/    _/   \n'
    # l2 = '\t   _/            _/        _/    _/    _/  _/    _/            _/_/      _/    _/  _/    _/  _/    _/  _/_/    _/  _/        _/    _/    \n'
    # l3 = '\t  _/_/_/        _/  _/_/  _/    _/      _/        _/_/          _/      _/_/_/    _/_/_/    _/_/_/_/  _/  _/  _/  _/        _/_/_/_/     \n'
    # l4 = '\t       _/      _/    _/  _/    _/      _/            _/        _/      _/    _/  _/    _/  _/    _/  _/    _/_/  _/        _/    _/      \n'
    # l5 = '\t_/_/_/          _/_/_/    _/_/        _/      _/_/_/          _/      _/_/_/    _/    _/  _/    _/  _/      _/    _/_/_/  _/    _/ \n'
    # logo = l1 + l2 + l3 + l4 + l5

    l1 = "\n\t   dvvvvvo.   v vvvvvvvvvv v vvvvvvvo. `v.`vvvb         ,v' v vvvvvvvvvv v vvvvvvvo.    b.             v         .v.   vvvvvvv vvvvvvvv  ,ovvvvvvo.    v vvvvvvvo.\n"
    l2 = "\t v.`vvv.  Yv  v vvv        v vv     `vv `v.`vvvb       ,v'  v vvv        v vv     `vv   Yvvvvo.        v        :vvv.        v vv     ,v vv      `vb   v vv     `vv\n"
    l3 = "\t `v.`vvv.     v vvv        v vv     ,vv  `v.`vvvb     ,v'   v vvv        v vv     ,vv   .`Yvvvvvo.     v       .`vvvv.       v vv     vv vv       `vb  v vv     ,vv\n"
    l4 = "\t  `v.`vvv.    v vvvvvvvvvv v vv.   ,vv'   `v.`vvvb   ,v'    v vvvvvvvvvv v vv.   ,vv'   vo. `Yvvvvvo.  v      .v.`vvvv.      v vv     vv vv        vv  v vv.   ,vv'\n"
    l5 = "\t   `v.`vvv.   v vvv        v vvvvvvvP'     `v.`vvvb ,v'     v vvv        v vvvvvvvP'    v`Yvo. `Yvvvvoov     .v`v.`vvvv.     v vv     vv vv        vv  v vvvvvvvP'\n"
    l6 = "\t    `v.`vvv.  v vvv        v vv`vb          `v.`vvvbv'      v vvv        v vv`vb        v   `Yvo. `Yvvvv    .v' `v.`vvvv.    v vv     vv vv        vP  v vv`vb\n"
    l7 = "\tvb   `v.`vvv. v vvv        v vv `vb.         `v.`vvv'       v vvv        v vv `vb.      v      `Yvo. `Yv   .v'   `v.`vvvv.   v vv     `v vv       ,vP  v vv `vb.\n"
    l8 = "\t`vb.  ;v.`vvv v vvv        v vv   `vb.        `v.`v'        v vvv        v vv   `vb.    v         `Yvo.`  .vvvvvvvvv.`vvvv.  v vv     `v vv     ,vv'   v vv   `vb.\n"
    l9 = "\t `YvvvP ,vvP' v vvvvvvvvvv v vv     `vv.       `v.`         v vvvvvvvvvv v vv     `vv.  v            `Yo .v'       `v.`vvvv. v vv       `vvvvvvvP'     v vv     `vv.\n"
    logo = l1 + l2 + l3 + l4 + l5 + l6 + l7 + l8 + l9

    print('\033[2J') # Clear screen
    print('\033[00H') # Move cursor to top left
    print('\033[36m') # Change color to blue
    print(logo)
    # print('\033[31m') # Change color to red
    print('\033[37m') # Change color to white

    # Run the flask API
    print('Server running on http://' + h + ':' + str(p))

    try:
        startup_process()
        io.run(app, port = p, host = h)
    except KeyboardInterrupt:
        print('^C received, shutting down the server...')
        
    shutdown_process()

# ============================================================================
#       Start on default port or on the one passed in as an argument
# ============================================================================
if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(p = int(argv[1]))
    else:
        run()
