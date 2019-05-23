const request = require('supertest');
const app = require('./comms');

let server = require('http').Server(app);
var io = require('socket.io-client');

describe('Test the /detection endpoint', () => {
    let data = {
        "Test": "123"
    };

    test('POST method should respons with code 200 OK', () => {
        return request(app).post("/detection")
        .send(JSON.stringify(data))
        .set('Content-Type',  'application/json')
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.statusCode).toBe(200)
        });
    });
});

/*
describe('Test the connection to the socket', () => {
    test('Connect to the server from a WebSocket', () => {
        /*
        let socket = io.connect('http://localhost:2000');
        
        return socket.on('connection', () => {
            console.log("Connected");
            socket.disconnect();
        });
        */
/*
        expect(true).toBe(true);
    });
});
*/


/*
        describe('Test the notification from the socket', () => {
    
    test('Receiving a notification of a detection from server', () => {
        // Send a mocked 'detection'
        request(app).post("/detection")
        .send(JSON.stringify({"Test": "123"}))
        .set('Content-Type',  'application/json')
        .set('Accept', 'application/json');

        let socket = io.connect('http://localhost:2000');
    });
});
*/