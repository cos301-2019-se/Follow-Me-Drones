// ===========================
//    Server heading stuff
// ===========================

let logo = '\n\t    _/_/_/_/        _/_/_/  _/    _/  _/      _/    _/_/_/        _/      _/_/_/    _/_/_/      _/_/    _/      _/    _/_/_/  _/    _/   \n'
            + '\t   _/            _/        _/    _/    _/  _/    _/            _/_/      _/    _/  _/    _/  _/    _/  _/_/    _/  _/        _/    _/    \n'
            + '\t  _/_/_/        _/  _/_/  _/    _/      _/        _/_/          _/      _/_/_/    _/_/_/    _/_/_/_/  _/  _/  _/  _/        _/_/_/_/     \n'
            + '\t       _/      _/    _/  _/    _/      _/            _/        _/      _/    _/  _/    _/  _/    _/  _/    _/_/  _/        _/    _/      \n'
            + '\t_/_/_/          _/_/_/    _/_/        _/      _/_/_/          _/      _/_/_/    _/    _/  _/    _/  _/      _/    _/_/_/  _/    _/ \n';

console.log('\033[2J'); // Clear screen
console.log('\033[0;0H'); // Move cursor to top left
console.log('\033[36m'); // Change color to blue
console.log(logo);
console.log('\033[31m'); // Change color to red
console.log('\033[37m'); // Change color to white

// ===========================
//    Get the dependencies
// ===========================

// Start express application
const app = require('express')();

const bodyParser = require('body-parser');

let server = require('http').Server(app);
let io = require('socket.io')(server);

// Support json encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// ===========================
//       Socket for app
// ===========================

// Global variable to keep a counter of the current socket connections
let currentConnections = 0;

// To execute system commands
let commandLine = require('child_process');
let runningCommand = null;

/*  Event: connection
*
*   socket.io connection event.
*   Increments a counter for the number of connections, if more than one app connects then it'll disconnect them.
*
*   Parameters:
*
*   socket - Parameter containing all the data about the socket connection.
*
*   Returns:
*
*   Nada
*
*   See Also:
*
*   <disconnect>
*/
io.on('connection', function (socket) {
    if(currentConnections >= 1)
    {
        console.log('Too many apps attempted to connect, kicked ' + socket.id);
        console.log('Current connections -> ' + currentConnections + '\n');
        io.sockets.connected[socket.id].disconnect();
    }
    else
    {
        ++currentConnections;
        console.log('App connected with id ' + socket.id);
        console.log('Current connections -> ' + currentConnections + '\n');
    }

    /*  Event: disconnect
    *
    *   socket.io disconnect event.
    *   Decrements the counter for number of connections, keeping track of the current connections.
    *
    *   Returns:
    *
    *   Nada
    *
    *   See Also:
    *
    *   <connection>
    */
    socket.on('disconnect', function () {
        --currentConnections;
        console.log('App disconnected with id ' + socket.id);
        console.log('Current connections -> ' + currentConnections + '\n');

        if(runningCommand)
        {
            console.log('Killing process with pid -> ' + (runningCommand.pid+1));
            process.kill(runningCommand.pid+1, 'SIGTERM');
        }
        });

    socket.on('message', function () {
        io.emit('Echo response');
        });

    socket.on('arm', function() {
        console.log('arming...');

        try
        {
            console.log('starting object recognition');

            process.chdir('../object-recognition/src/darknet_/');
            runningCommand = commandLine.exec('./darknet detector demo cfg/animals.data cfg/animals.cfg backup/animals_last.weights -c 0 -thresh 0.7 -json_port 8080 -out_filename data/videos/output/res.mkv > /dev/null');
            process.chdir('../../../server/');

            console.log('started object recognition with PID -> ' + runningCommand.pid);
        }
        catch (err)
        {
            console.error(err);
        }
    });

    socket.on('kill', function() {
        console.log('Killing process with pid -> ' + (runningCommand.pid+1));
        process.kill(runningCommand.pid+1, 'SIGTERM');
    });
});

// ===========================
//     Detection endpoint
// ===========================

let lastDetectedFrame = 0;
let previousDetections = [];
let newDetections = [];

/*  Endpoint: detection
*
*   Endpoint to alert the server of an object detection.
*   The object detection will send a POST request to the server notifying it of a detection.
*
*   Parameters:
*
*   req - Parameter containing all the data about the request being sent.
*   res - Parameter containing all the response data that will be sent back to the request sender.
*
*   Returns:
*
*   Success code of 200 if the function completes.
*
*   See Also:
*
*   <test>
*/
app.post('/detection', (req, res) => {
    // Test -> curl -X POST -d '{'Test':123}' -H 'Content-Type:application/json' http://127.0.0.1:8080/detection
    // ./darknet detector demo cfg/previousDetections.data cfg/previousDetections.cfg backup/previousDetections_last.weights data/videos/rhino-drone.mp4 -thresh 0.7 -json_port 8080

    /*  Data received in format
    *   JSON data:
    *   {
    *      frame_id: 39,
    *      objects:
    *      [{
    *          class_id: 2,
    *          name: 'rhino',
    *          relative_coordinates: [Object],
    *          confidence: 0.854001
    *      }]
    *   }
    */

    let detection = req.body;
    // Server will only check first detection and then each 50th frame thereafter
    if(Math.abs(detection['frame_id'] - lastDetectedFrame) > 50 || lastDetectedFrame === 0)
    {
        // If theres been over 100 frames without a detection, erase the list of old previousDetections as the camera has probably moved long past the last animal
        if(Math.abs(detection['frame_id'] - lastDetectedFrame) > 100)
        {
            previousDetections = [];
        }

        lastDetectedFrame = detection['frame_id'];

        let dX, dY;
        let threshX, threshY;
        let animalAlreadyDetected;

        // Count how many of each animal are present in the frame
        let animalCounters = [];
        for(let detectedAnimal of detection['objects'])
        {
            if(animalCounters[detectedAnimal.name])
            {
                ++animalCounters[detectedAnimal.name]['count'];
            }
            else
            {
                // Initialise the animals details, saving its name as the index, a count for how many of them there are, and its coordinates
                animalCounters[detectedAnimal.name] = [];
                animalCounters[detectedAnimal.name]['count'] = 1;
                animalCounters[detectedAnimal.name]['relative_coordinates'] = detectedAnimal['relative_coordinates'];
            }
        }

        for(let detectedAnimal in animalCounters)
        {
            // See if the old list of previousDetections animalAlreadyDetected the ones now detected
            animalAlreadyDetected = false;

            // If there is more than 1 of this type of animal, then handle it as a herd. Else check if its the same animal as previously
            if(animalCounters[detectedAnimal]['count'] > 1)
            {
                for(let animal of previousDetections)
                {
                    // If there exists a previousDetections name equal to the newly detected animal and the herd flag is set, then that animal has already been detected
                    if(animal['name'] === detectedAnimal && animal['herd'])
                    {
                        animalAlreadyDetected = true;
                        break;
                    }
                }

                if(!animalAlreadyDetected)
                {
                    console.log('New detection!');
                    console.log('\tFrame -> ' + detection['frame_id']);
                    console.log('\tHerd of -> ' + detectedAnimal);

                    io.emit('detection', { data: detection });
                }

                // Create a new list of the currently detected animals, with herd flag set to true
                newDetections.push({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': true});
            }
            else
            {
                // Check if the list of detections animalAlreadyDetected an animal with the same name, and if its position is within the threshold
                for(let animal of previousDetections)
                {
                    dX = Math.abs(animal['relative_coordinates']['center_x'] - animalCounters[detectedAnimal]['relative_coordinates']['center_x']);
                    dY = Math.abs(animal['relative_coordinates']['center_y'] - animalCounters[detectedAnimal]['relative_coordinates']['center_y']);

                    threshX = 4*animalCounters[detectedAnimal]['relative_coordinates']['width'];
                    threshY = 4*animalCounters[detectedAnimal]['relative_coordinates']['height'];

                    // If names are the same, and their X and Y coords are within a range of the thresholds, then its considered the same animal
                    if(animal['name'] === detectedAnimal && dX < threshX && dY < threshY)
                    {
                        animalAlreadyDetected = true;

                        // Update the previousDetections center coordinates
                        animal['relative_coordinates']['center_x'] = animalCounters[detectedAnimal]['relative_coordinates']['center_x'];
                        animal['relative_coordinates']['center_y'] = animalCounters[detectedAnimal]['relative_coordinates']['center_y'];
                        break;
                    }
                }

                // New detection
                if(!animalAlreadyDetected)
                {
                    console.log('New detection!');
                    console.log('\tFrame -> ' + detection['frame_id']);
                    console.log('\tAnimal -> ' + detectedAnimal);

                    io.emit('detection', { data: detection });
                }

                // Create a new list of the currently detected animals, with the herd flag set to false
                newDetections.push({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': false});
            }
        }

        // Replace the old list with the new list, since the camera is always moving 'forward', you can discard any previousDetections that have fallen out of frame
        previousDetections = newDetections;
        newDetections = [];
    }

    res.status(200).send();
});

/*  Endpoint: test
*
*   Endpoint for unit testing
*   Endpoint to test socket connection since it cannot really be sent
*
*   Parameters:
*
*   req - Parameter containing all the data about the request being sent.
*   res - Parameter containing all the response data that will be sent back to the request sender.
*
*   Returns:
*
*   Success code of 200 if the function completes
*   JSON array with a key-value pair of [status : 'connected']
*
*   See Also:
*
*   <detection>
*/
app.get('/test', (req, res) => {
    //res.write('Connection established');
    res.status(200).json({
        status : 'connected'
    });
});

// ===========================
//           Ports
// ===========================

let port = (process.env.PORT | 8080);

app.listen(port, function () {
    console.log('Server is running on port -> ' + port + '\n');
});

let socketPort = 6969;
server.listen(socketPort, function () {
    console.log('App socket listening on port -> ' + socketPort + '\n');
});
