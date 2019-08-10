from flask import Flask, request
from flask_socketio import SocketIO, emit, ConnectionRefusedError

import subprocess
import os
import base64

# Port for the server
_port = 42069
_host = '127.0.0.1'

# Flask app
app = Flask(__name__)

# ============================================================================
#                           Socket for the app
# ============================================================================
_currentConnections = 0
_runningCommand = False

io = SocketIO(app, cors_allowed_origins="*")

# Connection event
@io.on('connect')
def test_connect():
    global _currentConnections

    # Only allow one app to be connected at any given time
    if _currentConnections >= 1:
        print('Too many apps attempted to connect, kicked', request.sid)
        print('Current connections ->', _currentConnections)
        raise ConnectionRefusedError('Unauthorized!')
    else:
        _currentConnections += 1
        print('App connected with ID', request.sid)
        print('Current connections ->', _currentConnections)
        emit('response', {'data': 'Connected'})

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

    emit('response', {'data': 'Disconnected'})

# Arming event
@io.on('arm')
def arm():
    global _runningCommand

    print('Starting object recognition...')

    # Move into the darknet directory
    os.chdir('../object-recognition/src/darknet_/')

    # Video camera
    # _cmd = ['./darknet', 'detector', 'demo', 'cfg/animals.data', 'cfg/animals.cfg', 'backup/animals_last.weights', '-c 2', '-thresh 0.7', '-json_port 42069', '-out_filename ../../output.mkv', '-prefix ../../detections/img']
    
    # Video stream
    # ./darknet detector demo cfg/animals.data cfg/animals.cfg backup/animals_last.weights data/videos/african-wildlife.mp4 -thresh 0.7 -json_port 42069 -prefix ../../detections/img -out_filename ../../output.mkv
    _cmd = ['./darknet', 'detector', 'demo', 'cfg/animals.data', 'cfg/animals.cfg', 'backup/animals_last.weights', 'data/videos/african-wildlife.mp4', '-thresh', '0.7', '-json_port', '42069', '-out_filename', '../../output.mkv', '-prefix', '../../detections/img']

    _output = ""
    for opt in _cmd:
        _output += opt + " "

    print(_output)
    
    _runningCommand = subprocess.Popen(_cmd, cwd=os.getcwd(), stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    # Move back into the server directory
    os.chdir('../../../server/')

    # Wait for detection to start, then alert the app
    for line in iter(_runningCommand.stderr.readline, b''):
        if b'Done!' in line:
            print('Drone is armed! Beware poachers')
            emit('response', {'data': 'Armed'})
            break

# Return home event
@io.on('return-home')
def ETGoHome():
    pass

# Default GET, should never happen
@app.route('/', methods=["GET"])
def index():
    return '<html><head><title>Turn back now</title></head><body><p style="color: red; width: 100%; text-align: center; margin-top: 20%">01011001011011110111010100100000011100110110100001101111011101010110110001100100011011100010011101110100001000000110001001100101001000000110100001100101011100100110010100100001</p></body></html>'
# ============================================================================
#                           Handling detections
# ============================================================================

# Function to alert the app of a detection
def alertAppOfDetection(detection):
    _img = '../object-recognition/detections/img_' + str(detection['frame_id']).zfill(8) + '.jpg'

    with open(_img, 'rb') as img_file:
        _img_base64 = str(base64.b64encode(img_file.read()))

    io.emit('detection', {'data': detection, 'image': _img_base64})

# Filter global variables
lastDetectedFrame = 0
previousDetections = []
newDetections = []

# Endpoint for POST requests alerting the server of a detection
@app.route('/detection', methods=["POST"])
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

                    alertAppOfDetection(detection)

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

                    alertAppOfDetection(detection)

                # Create a new list of the currently detected animals, with the herd flag set to false
                newDetections.append({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': False})

        # Replace the old list with the new list, since the camera is always moving 'forward', you can discard any previousDetections that have fallen out of frame
        previousDetections = newDetections
        newDetections = []
    return ('', 200)

# ============================================================================
#                  Print the logo and run socket/server
# ============================================================================

def run(p = _port, h = _host):
    # l1 = '\n\t    _/_/_/_/        _/_/_/  _/    _/  _/      _/    _/_/_/        _/      _/_/_/    _/_/_/      _/_/    _/      _/    _/_/_/  _/    _/   \n'
    # l2 = '\t   _/            _/        _/    _/    _/  _/    _/            _/_/      _/    _/  _/    _/  _/    _/  _/_/    _/  _/        _/    _/    \n'
    # l3 = '\t  _/_/_/        _/  _/_/  _/    _/      _/        _/_/          _/      _/_/_/    _/_/_/    _/_/_/_/  _/  _/  _/  _/        _/_/_/_/     \n'
    # l4 = '\t       _/      _/    _/  _/    _/      _/            _/        _/      _/    _/  _/    _/  _/    _/  _/    _/_/  _/        _/    _/      \n'
    # l5 = '\t_/_/_/          _/_/_/    _/_/        _/      _/_/_/          _/      _/_/_/    _/    _/  _/    _/  _/      _/    _/_/_/  _/    _/ \n'
    # logo = l1 + l2 + l3 + l4 + l5

    l1 = "\n\t   d555555o.   5 555555555555 5 555555555o.`5.`555b          ,5' 5 555555555555 5 555555555o.           .5.          b.            5          .5.   5555555 555555555 ,o555555o.     5 55555555o.\n"
    l2 = "\t 5.`5555.   Y5 5 5555         5 5555     `55 `5.`555b       ,5'  5 5555         5 5555     `55         :5555.        Y5555o.       5         :555.        5 555    ,5 55       `5b   5 555     `55\n"
    l3 = "\t `5.`5555.     5 5555         5 5555     ,55  `5.`555b     ,5'   5 5555         5 5555     ,55        . `5555.       .`Y55555o.    5        .`5555.       5 555    55 55        `5b  5 555     ,55\n"
    l4 = "\t  `5.`5555.    5 555555555555 5 5555.   ,55'   `5.`555b   ,5'    5 555555555555 5 5555.   ,55'       .5. `5555.      5o. `Y55555o. 5       .5.`5555.      5 555    55 55         55  5 555.   ,55'\n"
    l5 = "\t   `5.`5555.   5 5555         5 555555555P'     `5.`555b ,5'     5 5555         5 555555555P'       .5`5. `5555.     5`Y5o. `Y5555o5      .5`5.`5555.     5 555    55 55         55  5 55555555P'\n"
    l6 = "\t    `5.`5555.  5 5555         5 5555`5b          `5.`555b5'      5 5555         5 5555`5b          .5' `5. `5555.    5   `Y5o. `Y555     .5' `5.`5555.    5 555    55 55         5P  5 555`5b\n"
    l7 = "\t5b   `5.`5555. 5 5555         5 5555 `5b.         `5.`555'       5 5555         5 5555 `5b.       .5'   `5. `5555.   5      `Y5o. `Y5   .5'   `5.`5555.   5 555    `5 55        ,5P  5 555 `5b.\n"
    l8 = "\t`5b.  ;5.`5555 5 5555         5 5555   `5b.        `5.`5'        5 5555         5 5555   `5b.    .555555555. `5555.  5         `Y5o.`  .555555555.`5555.  5 555     ` 555     ,55'   5 555   `5b.\n"
    l9 = "\t `Y5555P ,55P' 5 555555555555 5 5555     `55.       `5.`         5 555555555555 5 5555     `55. .5'       `5. `5555. 5            `Yo .5'       `5.`5555. 5 555       `5555555P'     5 555     `55.\n"
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
        io.run(app, port = p, host = h)
    except KeyboardInterrupt:
        print('^C received, shutting down the server...')
        io.stop()

# ============================================================================
#       Start on default port or on the one passed in as an argument
# ============================================================================
if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(p = int(argv[1]))
    else:
        run()
