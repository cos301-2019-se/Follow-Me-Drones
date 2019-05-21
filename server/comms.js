// ===========================
// Get the dependencies
// ===========================

const express = require("express");
const bodyParser = require("body-parser");

// start express application
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));

// ---------------------------
// Enable CORS on ExpressJS
// ---------------------------
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// ---------------------------
// Post authenticate
// ---------------------------
app.post('/detection', function(req, response)
{
    console.log("POST");
    /* Data received in format
    JSON data:
    {
        "frame_id":696, 
        "objects": [ 
            {"class_id":2, "name":"lion", "relative_coordinates":{"center_x":0.493874, "center_y":0.655773, "width":1.137844, "height":0.575388}, "confidence":0.269735}
        ] 
    }

    {"frame_id":696,"objects": [{"class_id":2, "name":"lion", "relative_coordinates":{"center_x":0.493874, "center_y":0.655773, "width":1.137844, "height":0.575388}, "confidence":0.269735}]}
    */

    console.log(req.body);
    // var receivedData = JSON.parse(req.data);
    // console.log(receivedData);

    response.send();
});

// ---------------------------
// Get authenticate
// ---------------------------


// ===========================
// Specify the port to use
// ===========================

let port = process.env.PORT;
if (port == null || port === "") {
    port = 8080;
}

app.listen(port, function () {
    console.log("Server is running on port -> " + port);
});