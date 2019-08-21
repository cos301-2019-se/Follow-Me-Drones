from pyparrot.Bebop import Bebop
# import threading
import sys
from pynput import keyboard

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
        print('alphanumeric key {0} pressed'.format(key.char))

        # Moving Forward / Back / Left / Right
        # w
        if key.char == 'w':
            print('Moving forward')
            _dx = 0.1
        
        if key.char == 's':
            print('Moving backward')
            _dx = -0.1
        
        if key.char == 'q':
            print('Strafe left')
            _dy = -0.1
        
        if key.char == 'e':
            print('Strafe right')
            _dy = 0.1

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
            _rad = -15
        
        if key.char == 'd':
            print('Rotating right')
            _rad = 15

        _bebop.move_relative(_dx, _dy, _dz, _rad)
        
    except AttributeError:
        # print('special key {0} pressed'.format(key))

        # Vertical controls
        # ctrl
        if key == 'Key.ctrl':
            print('Moving down')
            _dz = 0.1

        # space
        if key == 'Key.space':
            print('Moving up')
            _dz = -0.1

def on_release(key):
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
            print('{0}% Command: '.format(_bebop.sensors.battery), end='')

            # print('Command: ', end='')
            _option = input()
            
            if _option == 'take-off': # take-off
                # Create a virtual dome in which the drone must remain
                _bebop.set_max_altitude(2.5)
                _bebop.set_max_distance(10)
                _bebop.enable_geofence(1)

                print('Taking off...', end='')
                _bebop.safe_takeoff(5)
            elif _option == 'land': # land
                print('Landing...', end='')
                _bebop.safe_land(5)
                print('Done!')
            elif _option == 'manual':
                # Collect events until released
                with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
                    listener.join()

                sys.stdin.flush()
            elif _option == 'quit':
                print('Bye')
                break
            else:
                print('Invalid command')
    except KeyboardInterrupt:
        print('Interrupt received... Bye!')
    # disconnect nicely so we don't need a reboot
    _bebop.disconnect()
else:
    print('Error connecting to bebop.  Retry')