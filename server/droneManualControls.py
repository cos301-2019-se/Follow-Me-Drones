import olympe
import olympe_deps as od

from olympe.messages.ardrone3.Piloting import TakeOff, moveBy, Landing, PCMD, UserTakeOff
from olympe.messages.ardrone3.Animations import Flip
from olympe.messages.ardrone3.PilotingState import FlyingStateChanged
from olympe.enums.ardrone3.PilotingState import FlyingStateChanged_State
from olympe.messages.battery import health

"""
Basic commands

drone = olympe.Drone("192.168.42.1")
drone.connection()
drone(TakeOff()).wait()
drone(moveBy(10, 0, 0, 0)).wait()
drone(Landing()).wait()
drone.disconnection()
"""

from pynput import keyboard
from termios import tcflush, TCIFLUSH
import csv
import cv2
import math
import os
import sys
import shlex
import subprocess
import time

class BlackMagic:
    def __init__(self):
        # make bebop object
        # Debug levels
        # 4 - debug
        # 3 - info
        # 2 - warning
        # 1 - error
        # 0 - critical
        self.bebop = olympe.Drone("192.168.42.1", loglevel=2, drone_type=od.ARSDK_DEVICE_TYPE_BEBOP_2)
        self.stream_dir = os.path.join(os.getcwd(), 'stream/')

        if not os.path.exists(self.stream_dir):
            os.mkdir('stream')

        print("Olympe streaming output dir: {}".format(self.stream_dir))

        self.h264_frame_stats = []
        self.h264_stats_file = open(os.path.join(self.stream_dir, 'h264_stats.csv'), 'w+')
        self.h264_stats_writer = csv.DictWriter(self.h264_stats_file, ['fps', 'bitrate'])
        self.h264_stats_writer.writeheader()

    def start(self):
        # Connect the the drone
        success = self.bebop.connection()

        # start video stream
        self.bebop.set_streaming_output_files(
            h264_data_file=os.path.join(self.stream_dir, 'h264_data.264'),
            h264_meta_file=os.path.join(self.stream_dir, 'h264_metadata.json'),
            # Here, we don't record the (huge) raw YUV video stream
            # raw_data_file=os.path.join(self.stream_dir,'raw_data.bin'),
            # raw_meta_file=os.path.join(self.stream_dir,'raw_metadata.json'),
        )

        # Setup your callback functions to do some live video processing
        # self.bebop.set_streaming_callbacks(
        #     raw_cb=self.yuv_frame_cb,
        #     h264_cb=self.h264_frame_cb
        # )

        return success

    def arm(self):
        # start darknet
        darknet = ['./darknet', 'detector', 'demo', 'cfg/animals.data', 'cfg/animals.cfg', 'backup/animals_last.weights', 'udp://127.0.0.1:5123', '-thresh', '0.7', '-json_port', '42069', '-out_filename', '../../output.mkv']#, '-prefix', '../../detections/img', '-dont_show']

        darknet_command = subprocess.Popen(darknet, cwd='/home/sentinal/Desktop/Uni/Follow-Me-Drones/object-recognition/src/darknet_/', stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

        for line in iter(darknet_command.stderr.readline, b''):
            if b'Done!' in line:
                darknet_command.stderr.close()
                break
        
        self.bebop.start_video_streaming()

        time.sleep(1) # Hackerman

        # start ffmpeg
        # ffmpeg -re -i stream/h264_data.264 -c copy -movflags frag_keyframe+empty_moov -max_muxing_queue_size 9999 -f h264 udp://127.0.0.1:5123
        ffmpeg = ['/bin/ffmpeg', '-re', '-i', 'stream/h264_data.264', '-c', 'copy', '-f', 'h264', 'udp://127.0.0.1:5123']

        ffmpeg_command = subprocess.Popen(ffmpeg, cwd=os.getcwd())#, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
    def stop(self):
        # Properly stop the video stream and disconnect
        self.bebop.stop_video_streaming()
        self.bebop.disconnection()
        # self.h264_stats_file.close()

    def yuv_frame_cb(self, yuv_frame):
        """
        This function will be called by Olympe for each decoded YUV frame.

            :type yuv_frame: olympe.VideoFrame
        """
        # the VideoFrame.info() dictionary contains some useful informations
        # such as the video resolution
        info = yuv_frame.info()
        height, width = info["yuv"]["height"], info["yuv"]["width"]

        # convert pdraw YUV flag to OpenCV YUV flag
        cv2_cvt_color_flag = {
            olympe.PDRAW_YUV_FORMAT_I420: cv2.COLOR_YUV2BGR_I420,
            olympe.PDRAW_YUV_FORMAT_NV12: cv2.COLOR_YUV2BGR_NV12,
        }[info["yuv"]["format"]]

        # yuv_frame.as_ndarray() is a 2D numpy array with the proper "shape"
        # i.e (3 * height / 2, width) because it's a YUV I420 or NV12 frame

        # Use OpenCV to convert the yuv frame to RGB
        cv2frame = cv2.cvtColor(yuv_frame.as_ndarray(), cv2_cvt_color_flag)

        # Use OpenCV to show this frame
        cv2.imshow("Olympe Streaming Example", cv2frame)
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
        frame_ts = info["ntp_raw_timestamp"]
        if not bool(info["h264"]["is_sync"]):
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
            shlex.split('ffmpeg -y -i {} -c:v copy {}'.format(
                h264_filepath, mp4_filepath)),
            check=True
        )

        # Replay this MP4 video file using the default video viewer (VLC?)
        # subprocess.run(
        #     shlex.split('xdg-open {}'.format(mp4_filepath)),
        #     check=True
        # )

    # Key press functions
    def on_press(self, key):
        try:
            # print('alphanumeric key {0} pressed'.format(key.char))

            # Moving Forward / Back / Left / Right
            # w
            if key.char == 'w':
                print('Moving forward')
                # self.bebop(moveBy(0.2, 0, 0, 0))
                # PCMD(flag, roll, pitch, yaw, gaz, timestampAndSeqNum, _timeout=10, _no_expect=False, _float_tol=(1e-07, 1e-09))
                self.bebop(PCMD(1, 0, 75, 0, 0, 50))
            
            if key.char == 's':
                print('Moving backward')
                # self.bebop(moveBy(-0.2, 0, 0, 0))
                self.bebop(PCMD(1, 0, -75, 0, 0, 50))
            
            if key.char == 'q':
                print('Strafe left')
                # self.bebop(moveBy(0, -0.2, 0, 0))
                self.bebop(PCMD(1, -75, 0, 0, 0, 50))
            
            if key.char == 'e':
                print('Strafe right')
                # self.bebop(moveBy(0, 0.2, 0, 0))
                self.bebop(PCMD(1, 75, 0, 0, 0, 50))

            # FLIPS!!!!!!
            # shift+w
            if key.char == 'W':
                print('forward flip')
                self.bebop(Flip(olympe.enums.ardrone3.Animations.Flip_Direction.front)).wait()

            # shift+q
            if key.char == 'Q':
                print('left flip')
                self.bebop(Flip(olympe.enums.ardrone3.Animations.Flip_Direction.left)).wait()

            # shift+e
            if key.char == 'E':
                print('right flip')
                self.bebop(Flip(olympe.enums.ardrone3.Animations.Flip_Direction.right)).wait()

            if key.char == 'S':
                print('backward flip')
                self.bebop(Flip(olympe.enums.ardrone3.Animations.Flip_Direction.back)).wait()
                
            # Rotating
            if key.char == 'a':
                print('Rotating left')
                # self.bebop(moveBy(0, 0, 0, -math.radians(30)))
                self.bebop(PCMD(1, 0, 0, -25, 0, 50))
            
            if key.char == 'd':
                print('Rotating right')
                # self.bebop(moveBy(0, 0, 0, math.radians(30)))
                self.bebop(PCMD(1, 0, 0, 25, 0, 50))
            
        except AttributeError:
            print('special key {0} pressed'.format(key))

            # Vertical controls
            # ctrl
            if key == keyboard.Key.ctrl:
                print('Moving down')
                # self.bebop(moveBy(0, 0, 1, 0)).wait()
                self.bebop(PCMD(1, 0, 0, 0, -25, 50))

            # space
            if key == keyboard.Key.space:
                print('Moving up')
                # self.bebop(moveBy(0, 0, -1, 0)).wait()
                self.bebop(PCMD(1, 0, 0, 0, 25, 50))

    def on_release(self, key):
        tcflush(sys.stdin, TCIFLUSH)
        print('{0} released'.format(key))
        if key == keyboard.Key.esc:
            # Stop listener
            return False

    def getBatteryPercentage(self):
        try:
            return self.bebop.query_state('battery')['common.CommonState.BatteryStateChanged']['percent']
        except:
            return 'uninitialized'

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

    def fly(self):
        try:
            while(True):
                print('\033[2J') # Clear screen
                print('\033[00H') # Move cursor to top left
                print('{0}% ({1}) Command: '.format(self.getBatteryPercentage(), self.getFlyingState()), end='')

                # print('Command: ', end='')
                _option = input()
                
                if _option == 'to': # take-off
                    print('Taking off...', end='')
                    self.bebop(TakeOff()).wait()
                    print('Done!')
                elif _option == 'x': # land
                    print('Landing...', end='')
                    self.bebop(Landing()).wait()
                    print('Done!')
                elif _option == 'auto':
                    # Enable autotakeoff
                    self.bebop(UserTakeOff(1))
                elif _option == 'm':
                    # Collect events until released
                    with keyboard.Listener(on_press=self.on_press, on_release=self.on_release) as listener:
                        listener.join()
                    tcflush(sys.stdin, TCIFLUSH)
                elif _option == 'quit':
                    print('Bye')
                    break
                else:
                    print('Invalid command:', _option)
        except KeyboardInterrupt:
            print('Interrupt received... Bye!')
        
if __name__ == "__main__":
    magic = BlackMagic()
    # Start the video stream
    if magic.start():
        # Arm the drone
        # magic.arm()
        # Perform some live video processing while the drone is flying
        magic.fly()
        # Stop the video stream
        # magic.stop()
        # Recorded video stream postprocessing
        # magic.postprocessing()
    else:
        print('Failed to connect to the drone')