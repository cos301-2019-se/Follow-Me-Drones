import unittest
import json

import commsTests

BASE_URL = 'http://127.0.0.1:42069'

class TestFlaskApi(unittest.TestCase):
    def test_connect(self):
        client = comms.io.test_client(comms.app)
        self.assertFalse(client.is_connected())

    def test_get(self):
        client = comms.app.test_client()
        response = client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_ping(self):
        response = comms.ping()
        self.assertEqual(response[1], 200)

    def test_detection_valid(self):
        client = comms.app.test_client()
        item = '{"frame_id":121, "objects": [ {"class_id":1, "name":"elephant", "relative_coordinates":{"center_x":0.465886, "center_y":0.690794, "width":0.048322, "height":0.065592}, "confidence":0.704248}]}'
        response = client.post('/detection', data=item, content_type='application/json')

if __name__ == "__main__":
    unittest.main()