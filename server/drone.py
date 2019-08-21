from pyparrot.Bebop import Bebop
# import threading
import keyboard

# make my bebop object
bebop = Bebop()

# connect to the bebop
# success = bebop.connect(5)
success = True

if (success):
    # start up the video
    try:
        print('Turning on the video stream')
        # bebop.start_video_stream()

        while(True):
            # bebop.ask_for_state_update()
            # print(str(_bebop.sensors.battery + '% Command: ', end='')
            print('Command: ', end='')
            _option = input()
            
            if _option == 'take-off': # take-off
                # Create a virtual dome in which the drone must remain
                # _bebop.set_max_altitude(2.5)
                # _bebop.set_max_distance(5)
                # _bebop.enable_geofence(1)

                print('Taking off...', end='')
                # bebop.safe_takeoff(5)
            elif _option == 'land': # land
                print('Landing...', end='')
                # bebop.safe_land(5)
                print('Done!')
            elif _option == 'manual':
                _dx = 0
                _dy = 0
                _dz = 0
                _rad = 0
                while(True):
                    try:
                        # Forward / Back / Left / Right
                        if keyboard.is_pressed('w'):
                            print('Moving forward')
                            _dx = 0.1

                        if keyboard.is_pressed('s'):
                            print('Moving backward')
                            _dx = -0.1

                        if keyboard.is_pressed('q'):
                            print('Strafe left')
                            _dy = -0.1
                        
                        if keyboard.is_pressed('e'):
                            print('Strafe right')
                            _dy = 0.1

                        # Vertical controls
                        if keyboard.is_pressed('space'):
                            print('Moving up')
                            _dz = -0.1
                            
                        if keyboard.is_pressed('ctrl'):
                            print('Moving down')
                            _dz = 0.1
                            
                        # Rotating
                        if keyboard.is_pressed('a'):
                            print('Rotating left')
                            _rad = -15
                        
                        if keyboard.is_pressed('d'):
                            print('Rotating right')
                            _rad = 15

                        # FLIPS!!!!!!
                        if keyboard.is_pressed('shift+w'):
                            print('forward flip')
                            _bebop.flip('front') # front, back, right, left

                        if keyboard.is_pressed('shift+s'):
                            print('backward flip')
                            _bebop.flip('back')
                        
                        if keyboard.is_pressed('shift+a'):
                            print('left flip')
                            _bebop.flip('left')
                        
                        if keyboard.is_pressed('shift+d'):
                            print('right flip')
                            _bebop.flip('right')
                        
                        if keyboard.is_pressed('esc'):
                            break

                        bebop.smart_sleep(0.2)

                        _dx = 0
                        _dy = 0
                        _dz = 0
                        _rad = 0
                    except:
                        break
            elif _option == 'quit':
                print('Bye')
                break
            else:
                print('Invalid command')
    except KeyboardInterrupt:
        print('Interrupt received... Bye!')
    # disconnect nicely so we don't need a reboot
    # bebop.disconnect()
else:
    print('Error connecting to bebop.  Retry')