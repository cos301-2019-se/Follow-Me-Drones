from http.server import BaseHTTPRequestHandler, HTTPServer
import cgi
import json
import socketserver

# Port for the server
_port = 42069

# ============================================================================
#                                  Socket
# ============================================================================
_socketPort = 6969



# ============================================================================
#                           Handling detections
# ============================================================================

# Filter global variables
lastDetectedFrame = 0
previousDetections = []
newDetections = []

def handleDetection(self):
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
    self._set_headers()

    global lastDetectedFrame
    global previousDetections
    global newDetections

    content_length = int(self.headers['Content-Length'])
    body = self.rfile.read(content_length)

    detection = json.loads(str(body, encoding='utf-8'))

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
                    print('New detection!')
                    print('\tFrame -> ', detection['frame_id'])
                    print('\tHerd of -> ', detectedAnimal)

                    #TODO: emit detection on socket

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
                    print('New detection!')
                    print('\tFrame ->', detection['frame_id'])
                    print('\tAnimal ->', detectedAnimal)

                    #TODO: emit detection on socket

                # Create a new list of the currently detected animals, with the herd flag set to false
                newDetections.append({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': False})

        # Replace the old list with the new list, since the camera is always moving 'forward', you can discard any previousDetections that have fallen out of frame
        previousDetections = newDetections
        newDetections = []

# ============================================================================
#        Black magic that handles incoming requests to the server
# ============================================================================
class BlackMagic(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    # If the server receives a GET request... that shouldn't happen
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'<html><head><title>Turn back now</title></head><body><p style="color: red; width: 100%; text-align: center; margin-top: 20%">01011001011011110111010100100000011100110110100001101111011101010110110001100100011011100010011101110100001000000110001001100101001000000110100001100101011100100110010100100001</p></body></html>')

    # If the server receives a POST request, handle the detection notification
    def do_POST(self):
        # Routing based on endpoints
        if self.path == '/detection':
            handleDetection(self)
        elif self.path == '/test':
            handleDetection(self)
            #TODO: implement tests
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><head><title>Try again</title></head><body><p style="color: red; width: 100%; text-align: center; margin-top: 20%">There\'s nothing here for you</p></body></html>')

# ============================================================================
#               Class that handles socket connections
# ============================================================================
class MyTCPHandler(socketserver.BaseRequestHandler):
    """
    The request handler class for our server.

    It is instantiated once per connection to the server, and must
    override the handle() method to implement communication to the
    client.
    """

    def handle(self):
        # self.request is the TCP socket connected to the client
        self.data = self.request.recv(1024).strip()
        print("{} wrote:".format(self.client_address[0]))
        print(self.data)
        # just send back the same data, but upper-cased
        self.request.sendall(self.data.upper())

# ============================================================================
#                     Print the logo and run server
# ============================================================================
def run(server_class=HTTPServer, handler_class=BlackMagic, port=_port):

    l1 = '\n\t    _/_/_/_/        _/_/_/  _/    _/  _/      _/    _/_/_/        _/      _/_/_/    _/_/_/      _/_/    _/      _/    _/_/_/  _/    _/   \n'
    l2 = '\t   _/            _/        _/    _/    _/  _/    _/            _/_/      _/    _/  _/    _/  _/    _/  _/_/    _/  _/        _/    _/    \n'
    l3 = '\t  _/_/_/        _/  _/_/  _/    _/      _/        _/_/          _/      _/_/_/    _/_/_/    _/_/_/_/  _/  _/  _/  _/        _/_/_/_/     \n'
    l4 = '\t       _/      _/    _/  _/    _/      _/            _/        _/      _/    _/  _/    _/  _/    _/  _/    _/_/  _/        _/    _/      \n'
    l5 = '\t_/_/_/          _/_/_/    _/_/        _/      _/_/_/          _/      _/_/_/    _/    _/  _/    _/  _/      _/    _/_/_/  _/    _/ \n'
    logo = l1 + l2 + l3 + l4 + l5

    print('\033[2J') # Clear screen
    print('\033[00H') # Move cursor to top left
    print('\033[36m') # Change color to blue
    print(logo)
    # print('\033[31m') # Change color to red
    print('\033[37m') # Change color to white

    # Http server
    httpd = server_class(('', port), handler_class)
    
    print('Serving http requests on ' + str(_port) + '...')
    httpd.serve_forever()

    # Socket server
    #TODO: this ain't workin
    socket_server = socketserver.TCPServer(('', _socketPort), MyTCPHandler)

    print('Serving sockets on ' + str(_socketPort) + '...')
    socket_server.serve_forever()

# ============================================================================
#       Start on default port or on the one passed in as an argument
# ============================================================================
if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port = int(argv[1]))
    else:
        run()