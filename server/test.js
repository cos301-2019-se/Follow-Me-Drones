const chai = require('chai');
const app = require('./comms');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const host = "127.0.0.1:";
//let server = require('http').Server(app);
//var io = require('socket.io-client');

describe('/detection endpoint', () => {
    const path = '/detection';

    it('POST method should respond with code 200 OK', () => {
        let port = "8080";
        let body = {
            "Test": 123
        };

        chai
            .request(host + port)
            .post(path)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
            });

    });
});