let logo = "\n\t    _/_/_/_/        _/_/_/  _/    _/  _/      _/    _/_/_/        _/      _/_/_/    _/_/_/      _/_/    _/      _/    _/_/_/  _/    _/   \n"
            + "\t   _/            _/        _/    _/    _/  _/    _/            _/_/      _/    _/  _/    _/  _/    _/  _/_/    _/  _/        _/    _/    \n"
            + "\t  _/_/_/        _/  _/_/  _/    _/      _/        _/_/          _/      _/_/_/    _/_/_/    _/_/_/_/  _/  _/  _/  _/        _/_/_/_/     \n"
            + "\t       _/      _/    _/  _/    _/      _/            _/        _/      _/    _/  _/    _/  _/    _/  _/    _/_/  _/        _/    _/      \n"
            + "\t_/_/_/          _/_/_/    _/_/        _/      _/_/_/          _/      _/_/_/    _/    _/  _/    _/  _/      _/    _/_/_/  _/    _/ \n";

console.log("\033[2J"); // Clear screen;
console.log("\033[0;0H"); // Move cursor to top left
console.log("\033[36m"); // Change color to blue
console.log(logo);
console.log("\033[31m"); // Change color to red
console.log("\033[37m"); // Change color to white

// ===========================
//    Get the dependencies
// ===========================

// start express application
const app = require("express")();

const bodyParser = require("body-parser");

let server = require('http').Server(app);
let io = require('socket.io')(server);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));

// ===========================
//       Socket for app
// ===========================

io.on('connection', function (socket) {

    console.log("App connected");

    socket.on('disconnect', function () {
        io.emit('App disconnected');
        });

    socket.on('message', function () {
        io.emit('Echo response');
        });
});

// ===========================
//          Detection
// ===========================

let lastFrame = 0;
let animals = [];
let animalsNew = [];
// TODO: Will always notify app if there are multiple detections of the same animal spread further away than the allowed movement threshold on line 98
app.post('/detection', (req, res) => {
    // Test -> curl -X POST -d '{"Test":123}' -H "Content-Type:application/json" http://127.0.0.1:8080/detection
    // ./darknet detector demo cfg/animals.data cfg/animals.cfg backup/animals_last.weights data/videos/rhino-drone.mp4 -thresh 0.7 -json_port 8080

    /* Data received in format
    JSON data:
    {
        frame_id: 39,
        objects:
        [{
            class_id: 2,
            name: 'rhino',
            relative_coordinates: [Object],
            confidence: 0.854001
        }]
    }
    */

    var detection = req.body;
    // Server will only check first detection and then each 50th frame thereafter
    if(Math.abs(detection["frame_id"] - lastFrame) > 50 || lastFrame === 0)
    {
        // If theres been over 100 frames without a detection, erase the list of old animals
        if(Math.abs(detection["frame_id"] - lastFrame) > 100)
            animals = [];

        lastFrame = detection["frame_id"];

        let dX, dY;
        let threshX, threshY;
        let contains;
        for(let i = 0; i < detection["objects"].length; ++i)
        {
            // See if the old list of animals contains the ones now detected
            contains = false;
            for(let j = 0; j < animals.length; ++j)
            {
                dX = Math.abs(animals[j]["relative_coordinates"]["center_x"] - detection["objects"][i]["relative_coordinates"]["center_x"]);
                dY = Math.abs(animals[j]["relative_coordinates"]["center_y"] - detection["objects"][i]["relative_coordinates"]["center_y"]);

                threshX = 4*detection["objects"][i]["relative_coordinates"]["width"];
                threshY = 4*detection["objects"][i]["relative_coordinates"]["height"];

                // If names are the same, and their X and Y coords are within a range of the thresholds, then its considered the same animal
                if(animals[j]["name"] === detection["objects"][i]["name"] && dX < threshX && dY < threshY)
                {
                    contains = true;

                    // Update the animals center coordinates
                    animals[j]["relative_coordinates"]["center_x"] = detection["objects"][i]["relative_coordinates"]["center_x"];
                    animals[j]["relative_coordinates"]["center_y"] = detection["objects"][i]["relative_coordinates"]["center_y"];
                    break;
                }
            }

            // New detection
            if(!contains)
            {
                console.log("New detection!");
                console.log("\tFrame -> " + detection["frame_id"]);
                console.log("\tAnimal -> " + detection["objects"][i]["name"]);

                io.emit('detection', { data: detection });
            }

            // Create a new list of the currently detected animals
            animalsNew.push({"name": detection["objects"][i]["name"], "relative_coordinates": detection["objects"][i]["relative_coordinates"]});
        }

        // Replace the old list with the new list, since the camera is always moving "forward", you can discard any animals that have fallen out of frame
        animals = animalsNew;
        animalsNew = [];
    }

    res.status(200).send();
});

// Endpoint to test socket connection since it cannot really be sent
app.get('/test', (req, res) => {
    //res.write("Connection established");
    res.status(200).json({
        status : "connected"
    });
});

// ===========================
//           Ports
// ===========================

let port = (process.env.PORT | 8080);

app.listen(port, function () {
    console.log("Server is running on port -> " + port + "\n");
});

let socketPort = 6969;
server.listen(socketPort, function () {
    console.log("App socket listening on port -> " + socketPort + "\n");
});