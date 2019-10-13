import os
import csv
import cv2

import olympe
import olympe_deps as od
import math
import time
import shlex
import threading

import subprocess

# enums
from olympe.enums.ardrone3.Piloting import Circle_Direction, MoveTo_Orientation_mode
from olympe.enums.ardrone3.GPSSettings import HomeType_Type
from olympe.enums.ardrone3.PilotingState import FlyingStateChanged_State

# messages
from olympe.messages.ardrone3.Piloting import TakeOff, moveBy, Landing, PCMD, UserTakeOff, NavigateHome, Circle, moveTo
from olympe.messages.ardrone3.GPSSettings import ReturnHomeMinAltitude, HomeType
from olympe.messages.ardrone3.Animations import Flip
from olympe.messages.ardrone3.PilotingState import FlyingStateChanged, GpsLocationChanged, moveToChanged
from olympe.messages.ardrone3.PilotingSettingsState import CirclingRadiusChanged
from olympe.messages.ardrone3.PilotingSettings import MaxDistance, NoFlyOverMaxDistance
from olympe.messages.ardrone3.GPSSettingsState import GPSFixStateChanged, HomeChanged

from olympe.messages.battery import health

class Drone():
    def __init__(self):
        print('init drone')
          # make bebop object
        # Debug levels
        # 4 - debug
        # 3 - info
        # 2 - warning
        # 1 - error
        # 0 - critical
        self.bebop = olympe.Drone('192.168.42.1', loglevel=0, drone_type=od.ARSDK_DEVICE_TYPE_BEBOP_2)
        self.stream_dir = os.path.join(os.getcwd(), 'stream/')
        if not os.path.exists(self.stream_dir):
            os.mkdir('stream')

        print('Olympe streaming output dir: {}'.format(self.stream_dir))

        self.drone_location = 0.0

        self.ffmpeg_interval = False
        self.ffmpeg_command = False
        self.ffmpeg = shlex.split('/bin/ffmpeg -re -i stream/h264_data.264 -c copy -f h264 udp://127.0.0.1:5123')

    def connect(self, liveStream):
        # Connect the the drone
        success = self.bebop.connection()

        if not success:
            return False

        # You can record the video stream from the drone if you plan to do some
        # post processing.
        self.bebop.set_streaming_output_files(
            h264_data_file=os.path.join(self.stream_dir, 'h264_data.264'),
            h264_meta_file=os.path.join(self.stream_dir, 'h264_metadata.json')
        )

        # Setup your callback functions to do some live video processing
        if liveStream:
            self.bebop.set_streaming_callbacks(
                raw_cb=self.yuv_frame_cb,
                h264_cb=self.h264_frame_cb
            )
        else:
            self.bebop.set_streaming_callbacks(
                h264_cb=self.h264_frame_cb
            )

        self.bebop(NoFlyOverMaxDistance(0)) # Disable the geofence
        self.bebop(ReturnHomeMinAltitude(10)) # When the drone flies home, it will make sure to be above 10m first
        self.bebop(HomeType(HomeType_Type.TAKEOFF)) # Set the home to be where the drone took off

        return True

