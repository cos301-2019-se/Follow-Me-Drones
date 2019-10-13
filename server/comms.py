from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, ConnectionRefusedError
from flask_cors import CORS

from controllers.system.system_controller import SystemController
from controllers.object_detection.detection_controller import DetectionController

from controllers.object_detection.video import Video
from controllers.object_detection.webcam import Webcam

from exceptions.connection_exceptions import DroneConnectionError
from exceptions.connection_exceptions import IncorrectNetwork
from exceptions.detection_exceptions import DetectionException



import subprocess
import signal, os
import glob
import base64
import time
import shlex
import threading

# Port for the server
port = 42069
host = '0.0.0.0'

# Flask app
app = Flask(__name__)
CORS(app)


# ============================================================================
#                           Socket for the app
# ============================================================================
# Create the socket, with all origins allowed
io = SocketIO(app, cors_allowed_origins="*", monitor_clients=True)

from controllers.system.no_drone import NoDrone
# systemContoller = SystemController( NoDrone( Webcam(camera_id=0) ) )
systemContoller = SystemController( NoDrone( Video() ) )

# from controllers.system.with_drone import WithDrone
# systemContoller = SystemController( WithDrone() )

@io.on('connect')
def connect():
    try:
        systemContoller.connectDrone()
        print('App connected with ID: ', request.sid, '\n')
    except DroneConnectionError as error:
        print( error.getMessage() )
        raise ConnectionRefusedError('Failed')
    except IncorrectNetwork as error:
        print( error.getMessage() )

# Disconnection event
@io.on('disconnect')
def disconnect():
    systemContoller.disconnectDrone()
    print('App disconnected with ID', request.sid)

# Arming event
@io.on('arm_drone')
def arm():
    try:
        systemContoller.armDrone()
        emit('drone_armed')
    except Exception:
        emit('error')

# Disarm event
@io.on('disarm_drone')
def disarm():
    try:
        systemContoller.disarmDrone()
        emit('drone_disarmed')
    except Exception:
        pass

# Return home event
@io.on('return-home')
def ETGoHome():
    global bebop
    # bebop.go_home()

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

    # if bebop.is_drone_streaming():
        print('Turning off drone stream...', end='')
        # bebop.stop_maintenance()
        # bebop.stop_video_stream()
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
    session_time = systemContoller.getSessionTime()
    img = '../object-recognition/detections/' +  session_time  + '/' + image_id

    with open(img, 'rb') as img_file:
        return str(base64.b64encode(img_file.read()))

# Endpoint for the app to request an image based on an image_id
@app.route('/image', methods=['POST'])
def return_image():
    blob = convertImageToBase64(request.get_json()['image'])
    return (jsonify(blob), 200)

# ============================================================================
#                           Handling detections
# ============================================================================

# Function to alert the app of a detection
def alertAppOfDetection(frame_id, detection):
    img = 'img_' + str(frame_id).zfill(8) + '.jpg'

    io.emit('detection', {'detection': detection, 'image': img})

detectionController = DetectionController()
# Endpoint for POST requests alerting the server of a detection
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
@app.route('/detection', methods=['POST'])
def detection():
    detection = request.json
    try:
        det = detectionController.newDetection(detection)
        detectedAnimal = det['animal']
        image = det['image']
        io.emit('detection', {'detection': detectedAnimal, 'image': image})
    except DetectionException as exp:
        pass

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
    # bebop.disconnect_drone()

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
    print('Server running on http://' + h + ':' + str(p), '\n')

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
