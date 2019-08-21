from pyparrot.Bebop import Bebop
# import threading
from pynput import keyboard
from termios import tcflush, TCIFLUSH
import math
import sys

# Movement variables
_dx = 0
_dy = 0
_dz = 0
_rad = 0

# Key press functions
def on_press(key):
    global _dx
    global _dy
    global _dz
    global _rad

    try:
        # print('alphanumeric key {0} pressed'.format(key.char))

        # Moving Forward / Back / Left / Right
        # w
        if key.char == 'w':
            print('Moving forward')
            _bebop.fly_direct(roll=0, pitch=75, yaw=0, vertical_movement=0, duration=0.005)
            # _dx = 1
        
        if key.char == 's':
            print('Moving backward')
            _bebop.fly_direct(roll=0, pitch=-75, yaw=0, vertical_movement=0, duration=0.005)
            # _dx = -1
        
        if key.char == 'q':
            print('Strafe left')
            _bebop.fly_direct(roll=-75, pitch=-0, yaw=0, vertical_movement=0, duration=0.005)
            #_dy = -1
        
        if key.char == 'e':
            print('Strafe right')
            _bebop.fly_direct(roll=75, pitch=-0, yaw=0, vertical_movement=0, duration=0.005)
            #_dy = 1

        # FLIPS!!!!!!
        # shift+w
        if key.char == 'W':
            print('forward flip')
            _bebop.flip('front')

        # shift+q
        if key.char == 'Q':
            print('left flip')
            _bebop.flip('left')

        # shift+e
        if key.char == 'E':
            print('right flip')
            _bebop.flip('right')

        if key.char == 'S':
            print('backward flip')
            _bebop.flip('back')
            
        # Rotating
        if key.char == 'a':
            print('Rotating left')
            _bebop.fly_direct(roll=0, pitch=0, yaw=-100, vertical_movement=0, duration=0.005)
            #_rad = math.radians(15)
        
        if key.char == 'd':
            print('Rotating right')
            _bebop.fly_direct(roll=0, pitch=0, yaw=100, vertical_movement=0, duration=0.005)

        # print('Moving:', _dx, _dy, _dz, _rad)
        # _bebop.move_relative(_dx, _dy, _dz, _rad)
        
    except AttributeError:
        print('special key {0} pressed'.format(key))

        # Vertical controls
        # ctrl
        if key == keyboard.Key.ctrl:
            print('Moving down')
            _bebop.fly_direct(roll=0, pitch=0, yaw=0, vertical_movement=-50, duration=0.005)

        # space
        if key == keyboard.Key.space:
            print('Moving up')
            _bebop.fly_direct(roll=0, pitch=0, yaw=0, vertical_movement=50, duration=0.005)

        # _bebop.move_relative(_dx, _dy, _dz, _rad)

def on_release(key):
    tcflush(sys.stdin, TCIFLUSH)
    print('{0} released'.format(key))
    if key == keyboard.Key.esc:
        # Stop listener
        return False

    _dx = 0
    _dy = 0
    _dz = 0
    _rad = 0

# make my bebop object
_bebop = Bebop()

# connect to the bebop
success = _bebop.connect(5)
# success = True

if (success):
    try:
        # start up the video
        print('Turning on the video stream')
        _bebop.start_video_stream()

        while(True):
            _bebop.ask_for_state_update()
            print('\033[2J') # Clear screen
            print('\033[00H') # Move cursor to top left
            print('{0}% ({1}) Command: '.format(_bebop.sensors.battery, _bebop.sensors.flying_state), end='')

            # print('Command: ', end='')
            _option = input()
            
            if _option == 'to': # take-off
                # Create a virtual dome in which the drone must remain
                _bebop.set_max_altitude(2.5)
                _bebop.set_max_distance(10)
                _bebop.enable_geofence(1)
                _bebop.set_max_tilt_rotation_speed(300)
                _bebop.set_max_rotation_speed(200)

                print('Taking off...', end='')
                _bebop.safe_takeoff(5)
            elif _option == 'x': # land
                print('Landing...', end='')
                _bebop.safe_land(5)
                print('Done!')
            elif _option == 'm':
                # Collect events until released
                with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
                    listener.join()
                tcflush(sys.stdin, TCIFLUSH)
            elif _option == 'quit':
                print('Bye')
                break
            else:
                print('Invalid command')
    except KeyboardInterrupt:
        print('Interrupt received... Bye!')

    # disconnect nicely so we don't need a reboot
    _bebop.safe_land(5)
    _bebop.disconnect()
else:
    print('Error connecting to bebop.  Retry')