from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, ConnectionRefusedError
from flask_cors import CORS

import subprocess
import signal, os
import glob
import base64
import time
import shlex
import threading

# Drone stuff
from drone import Drone

bebop = Drone()

# Session time, used for directory names
# Initialised when drone is armed
session_time = False

# Port for the server
port = 42069
host = '0.0.0.0'

# Flask app
app = Flask(__name__)
CORS(app)

# Filter global variables
lastDetectedFrame = 0
previousDetections = []
newDetections = []

# ============================================================================
#                           Socket for the app
# ============================================================================
currentConnections = 0
darknet_command = False

# Create the socket, with all origins allowed
io = SocketIO(app, cors_allowed_origins="*", monitor_clients=True)

# Connection event
@io.on('connect')
def connect():
    global currentConnections
    global bebop

    print('App trying to connect...')

    # Only allow one app to be connected at any given time
    if currentConnections >= 1:
        # print('\nToo many apps attempted to connect to drone, kicked', request.sid)
        # print('Current connections ->', currentConnections, '\n')

        raise ConnectionRefusedError('Unauthorized!')
    else:
        # Establish connection to drone
        if bebop.connect_drone(liveStream = False):
            currentConnections += 1
            print('\nApp connected with ID', request.sid)
            print('Current connections ->', currentConnections, '\n')
        else:
            print('Failed to connect to drone')
            raise ConnectionRefusedError('Failure')
            emit('error')

# Disconnection event
@io.on('disconnect')
def disconnect():
    global currentConnections
    global bebop

    # Stop the processes
    stopProcesses()

    # Disconnect drone
    bebop.disconnect_drone()
    
    currentConnections -= 1
    print('App disconnected with ID', request.sid)
    print('Current connections ->', currentConnections)

# darknet_interval = False
# def maintain_darknet_stream(seconds):
#     global darknet_interval
#     def maintain():
#         global darknet_command
#         maintain_stream(seconds)

#         if darknet_command and darknet_command.poll() != None:
#             disarm()
#             arm()

#     darknet_interval = threading.Timer(seconds, maintain)
#     darknet_interval.start()

# def stop_darknet_maintenance():
#     global darknet_interval
#     if darknet_interval:
#         darknet_interval.cancel()
#         darknet_interval = False

# Arming event
@io.on('arm_drone')
def arm():
    global darknet_command
    global bebop
    global session_time

    session_time = time.strftime('%d%h%Y')

    print('Starting object recognition...', end='', flush=True)

    # Move into the darknet directory
    os.chdir('../object-recognition/src/darknet_/')

    # darknet
    darknet = shlex.split('./darknet detector demo cfg/animals.data cfg/animals-tiny.cfg backup/animals-tiny_last.weights udp://127.0.0.1:5123 -thresh 0.7 -json_port 42069 -prefix ../../detections/' + session_time + '/img -out_filename ../../output.mkv')# -dont_show')
    # darknet = shlex.split('./darknet detector demo cfg/coco.data cfg/yolov3.cfg backup/yolov3.weights udp://127.0.0.1:5123 -thresh 0.7 -json_port 42069 -prefix ../../detections/' + session_time + '/img -out_filename ../../output.mkv')# -dont_show')

    # will only fail if the directory already exists (i.e. drone armed, disarmed and armed again in same session)
    try:
        os.mkdir('../../detections/' + session_time)
    except:
        pass

    # if darknet is already running, kill it
    if darknet_command:
        darknet_command.kill()

    darknet_command = subprocess.Popen(darknet, cwd=os.getcwd(), stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)

    # Move back into the server directory
    os.chdir('../../../server/')

    detection_armed = False
    # Wait for detection to start, then alert the app
    for line in iter(darknet_command.stderr.readline, b''):
        if b'Done!' in line:
            print('Done!')
            print('Drone is armed! Beware poachers')
            emit('drone_armed')

            detection_armed = True
            darknet_command.stderr.close()
            break

    if detection_armed:
        # Start video streaming from drone to .264 file
        bebop.start_video_stream()
        emit('drone_armed')

        bebop.maintain_stream(12) # Maintain ffmpeg every X seconds

        # maintain_darknet_stream(5)

        # Launch the drone
        # bebop.launch_drone()
    else:
        print('Something went wrong arming detection...')

# Disarm event
@io.on('disarm_drone')
def disarm():
    global darknet_command
    global bebop

    stopProcesses()
    # stop_darknet_maintenance()

    # Land the drone at its home location and stop the video stream
    # bebop.go_home()
    # bebop.land_drone()
    
    emit('drone_disarmed')

# Return home event
@io.on('return-home')
def ETGoHome():
    global bebop
    bebop.go_home()

# Default GET, should never happen
@app.route('/', methods=['GET'])
def index():
    return '<html><head><title>Turn back now</title></head><body><p style="color: red; width: 100%; text-align: center; margin-top: 20%">01011001011011110111010100100000011100110110100001101111011101010110110001100100011011100010011101110100001000000110001001100101001000000110100001100101011100100110010100100001</p></body></html>', 200

# Endpoint to ping server
@app.route('/ping', methods=['GET'])
def ping():
    return '[{"pong"}]', 200

# Stop the darknet command and the drone streaming
def stopProcesses():
    global darknet_command
    global bebop

    # If the detection is running and the app disconnects, turn it off
    if darknet_command:
        print('Turning off object detection...', end='')
        darknet_command.kill()
        darknet_command = False
        print('Done!')

    if bebop.is_drone_streaming():
        print('Turning off drone stream...', end='')
        bebop.stop_maintenance()
        bebop.stop_video_stream()
        print('Done!')

# Update coords event
@app.route('/coords', methods=['POST'])
def coords():
    # global bebop

    # print('Changing location')

    # percentage = bebop.getBatteryPercentage()
    # print('\nBattery percentage: {}%'.format(percentage))

    # # make sure the drone is initialized
    # if percentage != 'uninitialized':
    #     percentage = int(percentage)

    #     # If the battery percentage is below 15% then return home and land
    #     if percentage <= 15:
    #         bebop.go_home()
    #         bebop.land_drone()

    #         print('Battery low, returning home')
    #         io.emit('battery-low')
    #     else:
    #         print('Received:', request.get_json())

    #         lat = request.get_json()['lat']
    #         lon = request.get_json()['lon']

    #         print('Moving to:', lat, lon)
    #         bebop.newCenterLocation(lat, lon)
    # else:
    #     print('uninitialized')

    return '', 200

# ============================================================================
#                             Handling images
# ============================================================================

# Converts the image in detections/ to base64
def convertImageToBase64(image_id):
    global session_time
    img = '../object-recognition/detections/' + session_time + '/' + image_id

    with open(img, 'rb') as img_file:
        return str(base64.b64encode(img_file.read()))

# Endpoint for the app to request an image based on an image_id
@app.route('/image', methods=['POST'])
def return_image():
    global session_time

    if session_time:
        blob = convertImageToBase64(request.get_json()['image'])
        return (jsonify(blob), 200)
    else:
        return '', 500

# ============================================================================
#                           Handling detections
# ============================================================================

# Function to alert the app of a detection
def alertAppOfDetection(frame_id, detection):
    img = 'img_' + str(frame_id).zfill(8) + '.jpg'

    io.emit('detection', {'detection': detection, 'image': img})

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
                    print('\tMultiple ->', detectedAnimal, '\n')

                    alertAppOfDetection(detection['frame_id'], 'multiple ' + detectedAnimal + ' detected')

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
    return '', 200

# ============================================================================
#                  Print the logo and run socket/server
# ============================================================================

def zipdir(session_dir, password):
    # subprocess.call(['7z', 'a', '-mx=9', '-t7z', '-p' + password, '-y', session_dir + '-detections.zip', session_dir + '/*'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    pass
    
def startup_process():
    pass

def shutdown_process():
    global bebop
    global session_time

    print('Beginning shutdown process... \n')

    # End session with drone
    stopProcesses()
    bebop.disconnect_drone()

    if session_time:
        # Create an encrypted zip file of all the detections
        print('Encrypting all detection images... ', end='', flush=True)

        os.chdir('../object-recognition/detections')
        
        # Create an encrypted zip of the files
        zipdir(session_time, 'Capstone69')

        print('Done!')

        # Delete all the unencrypted images
        print('Deleting all unencrypted detection images... ', end='', flush=True)

        os.chdir(session_time)

        files=glob.glob('*.jpg')
        for filename in files:
            os.remove(filename)

        os.chdir('../')

        os.rmdir(session_time)

        print('Done!')

        os.chdir('../../server/')

    # Stop the server
    io.emit('disconnect')
    io.stop()
    print('Done... Goodbye!')

def run(p = port, h = host):
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
