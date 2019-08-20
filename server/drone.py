from pyparrot.Bebop import Bebop
from pyparrot.DroneVision import DroneVision
# import threading
import cv2
import time

# make my bebop object
bebop = Bebop()

# connect to the bebop
success = bebop.connect(5)

if (success):
    # start up the video
    try:
        print("Turning on the video stream")
        bebop.start_video_stream()

        while(True):
            bebop.ask_for_state_update()
            print('Command (%d)', bebop.sensors.battery, end='')
            _option = input()
            
            if _option == "take-off": # take-off
                print("Taking off...", end='')
                bebop.safe_takeoff(5)
            elif _option == "land": # land
                print("Landing...", end='')
                bebop.safe_land(5)
                print("Done!")
            elif _option == "quit":
                print("Bye")
                break
            else:
                print("Invalid command")
    except KeyboardInterrupt:
        print("Interrupt received... Bye!")
    # disconnect nicely so we don't need a reboot
    bebop.disconnect()
else:
    print("Error connecting to bebop.  Retry")