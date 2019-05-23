const app = require('./comms');

let server = require('http').Server(app);

// ===========================
//           Ports
// ===========================

let port = process.env.PORT;
if (port == null || port === "") {
    port = 8181;
}

app.listen(port, function () {
    console.log("Server is running on port -> " + port + "\n");
});

let socketPort = 2000;
server.listen(socketPort, function () {
    console.log("App socket listening on port -> " + socketPort + "\n");
});