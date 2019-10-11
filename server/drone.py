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

"""
Basic commands

drone = olympe.Drone("192.168.42.1")
drone.connection()
drone(TakeOff()).wait()
drone(moveBy(10, 0, 0, 0)).wait()
drone(PCMD(flag, roll, pitch, yaw, gaz, timestampAndSeqNum, _timeout=10, _no_expect=False, _float_tol=(1e-07, 1e-09)))
drone(Landing()).wait()
drone.disconnection()
"""

class Drone:
    def __init__(self):
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

        self.is_connected = False
        self.is_streaming = False

        self.hover_altitude = 2.0
        self.drone_location = 0.0

        self.ffmpeg_interval = False
        self.ffmpeg_command = False
        self.ffmpeg = shlex.split('/bin/ffmpeg -re -i stream/h264_data.264 -c copy -f h264 udp://127.0.0.1:5123')

    # ============================================================================
    #                             Drone functions
    # ============================================================================
    def connect_drone(self, liveStream):
        # Connect the the drone
        success = self.bebop.connection()

        self.drone_home = self.bebop.get_state(HomeChanged)
        print('\nDrone home:', self.drone_home)

        if not success:
            return False

        self.is_connected = True

        # You can record the video stream from the drone if you plan to do some
        # post processing.
        self.bebop.set_streaming_output_files(
            h264_data_file=os.path.join(self.stream_dir, 'h264_data.264'),
            h264_meta_file=os.path.join(self.stream_dir, 'h264_metadata.json')
        )

        # Setup your callback functions to do some live video processing
        if(liveStream):
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

    def start_video_stream(self):
        if not self.is_streaming:
            self.h264_frame_stats = []

            self.h264_stats_file = open(
                os.path.join(self.stream_dir, 'h264_stats.csv'),
                'w+'
            )

            self.h264_stats_writer = csv.DictWriter(
                self.h264_stats_file,
                ['fps', 'bitrate']
            )

            self.h264_stats_writer.writeheader()

            # Start video streaming
            self.bebop.start_video_streaming()

            time.sleep(1) # hackerman

            # if ffmpeg is already running, kill it
            if self.ffmpeg_command:
                self.ffmpeg_command.kill()

            # start ffmpeg       
            self.ffmpeg_command = subprocess.Popen(
                self.ffmpeg,
                cwd=os.getcwd(),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            self.is_streaming = True

    def maintain_stream(self, seconds):
        def maintain():
            self.maintain_stream(seconds)

            self.stop_video_stream()

            self.start_video_stream()

        self.ffmpeg_interval = threading.Timer(seconds, maintain)
        self.ffmpeg_interval.start()

    def stop_maintenance(self):
        if self.ffmpeg_interval:
            self.ffmpeg_interval.cancel()
            self.ffmpeg_interval = False

    def stop_video_stream(self):
        if self.is_streaming:
            # Stop ffmpeg
            if self.ffmpeg_command:
                self.ffmpeg_command.kill()
                self.ffmpeg_command = False

            # Properly stop the video stream
            self.bebop.stop_video_streaming()

            self.h264_stats_file.close()

            self.is_streaming = False

    def is_drone_streaming(self):
        return self.is_streaming

    def disconnect_drone(self):
        if self.is_connected:
            # Land if the drone is flying
            flyingState = self.getFlyingState()
            
            if flyingState != 'landed':
                self.go_home()
                self.land_drone()

            # Properly stop the video stream and disconnect
            self.bebop.disconnection()

            self.is_connected = False

    def yuv_frame_cb(self, yuv_frame):
        """
        This function will be called by Olympe for each decoded YUV frame.

            :type yuv_frame: olympe.VideoFrame
        """
        # the VideoFrame.info() dictionary contains some useful informations
        # such as the video resolution
        info = yuv_frame.info()
        height, width = info['yuv']['height'], info['yuv']['width']

        # convert pdraw YUV flag to OpenCV YUV flag
        cv2_cvt_color_flag = {
            olympe.PDRAW_YUV_FORMAT_I420: cv2.COLOR_YUV2BGR_I420,
            olympe.PDRAW_YUV_FORMAT_NV12: cv2.COLOR_YUV2BGR_NV12,
        }[info['yuv']['format']]

        # yuv_frame.as_ndarray() is a 2D numpy array with the proper 'shape'
        # i.e (3 * height / 2, width) because it's a YUV I420 or NV12 frame

        # Use OpenCV to convert the yuv frame to RGB
        cv2frame = cv2.cvtColor(yuv_frame.as_ndarray(), cv2_cvt_color_flag)

        # Use OpenCV to show this frame
        cv2.imshow('Olympe Streaming Example', cv2frame)
        cv2.waitKey(1)  # please OpenCV for 1 ms...

    def h264_frame_cb(self, h264_frame):
        """
        This function will be called by Olympe for each new h264 frame.

            :type yuv_frame: olympe.VideoFrame
        """

        # Get a ctypes pointer and size for this h264 frame
        frame_pointer, frame_size = h264_frame.as_ctypes_pointer()

        # For this example we will just compute some basic video stream stats
        # (bitrate and FPS) but we could choose to resend it over an another
        # interface or to decode it with our preferred hardware decoder..

        # Compute some stats and dump them in a csv file
        info = h264_frame.info()
        frame_ts = info['ntp_raw_timestamp']
        if not bool(info['h264']['is_sync']):
            if len(self.h264_frame_stats) > 0:
                while True:
                    start_ts, _ = self.h264_frame_stats[0]
                    if (start_ts + 1e6) < frame_ts:
                        self.h264_frame_stats.pop(0)
                    else:
                        break
            self.h264_frame_stats.append((frame_ts, frame_size))
            h264_fps = len(self.h264_frame_stats)
            h264_bitrate = (
                8 * sum(map(lambda t: t[1], self.h264_frame_stats)))
            self.h264_stats_writer.writerow(
                {'fps': h264_fps, 'bitrate': h264_bitrate})

    def postprocessing(self):
        # Convert the raw .264 file into an .mp4 file
        h264_filepath = os.path.join(self.stream_dir, 'h264_data.264')
        mp4_filepath = os.path.join(self.stream_dir, 'h264_data.mp4')
        subprocess.run(
            shlex.split('ffmpeg -i {} -c:v copy {}'.format(
                h264_filepath, mp4_filepath)),
            check=True
        )

        # Replay this MP4 video file using the default video viewer (VLC?)
        # subprocess.run(
        #     shlex.split('xdg-open {}'.format(mp4_filepath)),
        #     check=True
        # )

    def getFlyingState(self):
        try:
            state = self.bebop.get_state(FlyingStateChanged)['state']

            if state is FlyingStateChanged_State.landed:
                return 'landed'
            elif state is FlyingStateChanged_State.hovering:
                return 'hovering'
            elif state is FlyingStateChanged_State.landing:
                return 'landing'
            elif state is FlyingStateChanged_State.takingoff:
                return 'taking off'
            elif state is FlyingStateChanged_State.flying:
                return 'flying'
            else:
                return state
        except:
            return 'uninitialized'

    def getBatteryPercentage(self):
        try:
            return self.bebop.query_state('battery')['common.CommonState.BatteryStateChanged']['percent']
        except:
            return 'uninitialized'

    def circle(self):
        # Start circling in a clockwise direction
        self.bebop(Circle(Circle_Direction.CW))

    def newCenterLocation(self, lat, lon):
        # print('Flying state:', self.getFlyingState())

        if self.getFlyingState() != 'landed':
            self.bebop(
                moveTo(lat, lon, self.drone_location['altitude'], MoveTo_Orientation_mode.TO_TARGET, 0.0)
                >> FlyingStateChanged(state='hovering', _timeout=5)
                >> moveToChanged(latitude=lat, longitude=lon, altitude=self.drone_location['altitude'], orientation_mode=MoveTo_Orientation_mode.TO_TARGET, status='DONE', _policy='wait')
                >> FlyingStateChanged(state='hovering', _timeout=5)
            )

        # self.circle()

    def launch_drone(self):
        print('Taking off...', end='', flush=True)

        self.bebop(
            FlyingStateChanged(state='hovering', _policy='check') |
            FlyingStateChanged(state='flying', _policy='check') |
            (
                # GPSFixStateChanged(fixed=1, _timeout=10, _policy='check_wait')
                # >> (
                (
                    TakeOff(_no_expect=True)
                    & FlyingStateChanged(state='hovering', _timeout=10, _policy='check_wait')
                )     
            )
        ).wait()

        self.drone_location = self.bebop.get_state(GpsLocationChanged)

        print('Done!')

        print('Moving...', end='', flush=True)

        self.bebop(
            moveBy(0, 0, -self.hover_altitude, 0) # Move drone up
            >> PCMD(1, 0, 0, 0, 0, 0) # Force drone to go into hovering state
            >> FlyingStateChanged(state='hovering', _timeout=5) # Set state to hovering
        ).wait().success()

        print('Done!')
        # self.circle()

    def land_drone(self):
        print('Landing...', end='', flush=True)
        self.bebop(
            Landing()
            >> FlyingStateChanged(state='landed', _timeout=5)
        ).wait()
        print('Done!')

    def go_home(self):
        print('ET going home...', end='', flush=True)
        # Start navigating home
        self.bebop(
            moveTo(self.drone_location['latitude'], self.drone_location['longitude'], self.drone_location['altitude'], 1, 0.0)
            >> FlyingStateChanged(state='hovering', _timeout=5)
            >> moveToChanged(latitude=self.drone_location['latitude'], longitude=self.drone_location['longitude'], altitude=self.drone_location['altitude'], orientation_mode=MoveTo_Orientation_mode.TO_TARGET, status='DONE', _policy='wait')
            >> FlyingStateChanged(state='hovering', _timeout=5)
        ).wait()
        print('Done!')