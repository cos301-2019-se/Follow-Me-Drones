import os
import csv
import cv2

import olympe
import olympe_deps as od
import shlex
import threading
import time

import subprocess

# enums
from olympe.enums.ardrone3.Piloting import MoveTo_Orientation_mode
from olympe.enums.ardrone3.GPSSettings import HomeType_Type
from olympe.enums.ardrone3.PilotingState import FlyingStateChanged_State

# messages
from olympe.messages.ardrone3.Piloting import TakeOff, moveBy, Landing, PCMD, Circle, moveTo
from olympe.messages.ardrone3.GPSSettings import ReturnHomeMinAltitude, HomeType
from olympe.messages.ardrone3.PilotingState import FlyingStateChanged, GpsLocationChanged, moveToChanged
from olympe.messages.ardrone3.PilotingSettings import MaxDistance, NoFlyOverMaxDistance
from olympe.messages.ardrone3.GPSSettingsState import GPSFixStateChanged

class Drone():
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

        self.droneLocation = 0.0

        self.ffmpegInterval = False
        self.ffmpegCommand = False

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

    def disconnect(self):
        self.bebop.disconnection()

    def startVideoStream(self):
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

    def startFfmpegRestream(self, socket):
        self.restreamSocket = socket
        
        print('streaming socket:', self.restreamSocket)
        ffmpeg = shlex.split('/bin/ffmpeg -re -i stream/h264_data.264 -c copy -f h264 ' + self.restreamSocket)

        # if ffmpeg is already running, kill it
        if self.ffmpegCommand:
            self.ffmpegCommand.kill()

        # start ffmpeg       
        self.ffmpegCommand = subprocess.Popen(
            ffmpeg,
            cwd=os.getcwd(),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

    def stopFfmpegRestream(self):
        if self.ffmpegCommand:
            self.ffmpegCommand.kill()
            self.ffmpegCommand = False

    def stopVideoStream(self):
        # Stop ffmpeg
        if self.ffmpegCommand:
            self.ffmpegCommand.kill()
            self.ffmpegCommand = False

        # Properly stop the video stream
        self.bebop.stop_video_streaming()

        self.h264_stats_file.close()

    def maintainFfmpegRestream(self, seconds):
        def maintain():
            self.maintainFfmpegRestream(seconds)

            self.stopVideoStream()

            self.startVideoStream()

            time.sleep(1)

            self.stopFfmpegRestream()

            self.startFfmpegRestream(self.restreamSocket)

        self.ffmpegInterval = threading.Timer(seconds, maintain)
        self.ffmpegInterval.start()

    def stopFfmpegMaintenance(self):
        if self.ffmpegInterval:
            self.ffmpegInterval.cancel()
            self.ffmpegInterval = False

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

    def launch(self, hover_altitude):
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

        if hover_altitude > 0:
            self.bebop(
                moveBy(0, 0, -hover_altitude, 0) # Move drone up
                >> PCMD(1, 0, 0, 0, 0, 0) # Force drone to go into hovering state
                >> FlyingStateChanged(state='hovering', _timeout=5) # Set state to hovering
            ).wait().success()

        # self.circle()

    def land(self):
        print('Landing...', end='', flush=True)
        self.bebop(
            Landing()
            >> FlyingStateChanged(state='landed', _timeout=5)
        ).wait()
        print('Done!')

    def goHome(self):
        print('ET going home...', end='', flush=True)
        # Start navigating home
        self.bebop(
            moveTo(self.drone_location['latitude'], self.drone_location['longitude'], self.drone_location['altitude'], 1, 0.0)
            >> FlyingStateChanged(state='hovering', _timeout=5)
            >> moveToChanged(latitude=self.drone_location['latitude'], longitude=self.drone_location['longitude'], altitude=self.drone_location['altitude'], orientation_mode=MoveTo_Orientation_mode.TO_TARGET, status='DONE', _policy='wait')
            >> FlyingStateChanged(state='hovering', _timeout=5)
        ).wait()
        print('Done!')

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
