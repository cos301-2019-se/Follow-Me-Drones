from __future__ import print_function
from dronekit import connect, VehicleMode, Vehicle, LocationGlobalRelative, mavlink
import time
import sys
import math

# definitions
CONNECT = 'CONNECT'
DISCONNECT = 'DISCONNECT'
CANCEL = 'CANCEL'
GO_TO_POINT = 'GO_TO'
ARM = 'ARM'

drone: Vehicle
home: "global"

#functions
# Connect to drone using UDP
def connect_to_drone(args):
  global drone
  try:
    #udp_port = args[1]
    udp_port = "14551"
    print('Connecting to drone on UDP port: %s' % udp_port)
    drone = connect('udp:127.0.0.1:' + udp_port, wait_ready=True)
    print('CONNECT_UDP: SUCCESS')
    sys.stdout.flush()
  except Exception as e:
    print('Error connecting to drone via UDP', e)
    print('CONNECT_UDP: FAILURE')
  return

#error function
def invalid(args):
	print("Invalid command")
	sys.stdout.flush()

#disconnect the drone
def disconnect_drone(args):
  global drone
  drone.close()
  print("Disconnected")
  sys.stdout.flush()

#cancel the flight
# RTL = return to launch zone
def return_to_base(args):
  global drone
  print("Returning to base")
  drone.mode = VehicleMode("RTL")
  sys.stdout.flush()

#arms the drone and makes it takeoff with a default height of 10m
def arm(args):
  global drone
  global home

  home = drone.location.global_relative_frame
  if(len(args) < 1):
    target_altitude = 10
  else:
    target_altitude = args[1]

  #wait for autopilot
  print('Drone initializing')
  sys.stdout.flush()
  while not drone.is_armable:
    time.sleep(1)
  
  print('Drone is arming')
  sys.stdout.flush()

  drone.mode = VehicleMode('GUIDED')
  drone.armed = True

  while not drone.armed:
    time.sleep(1)

  print('Drone is armed')
  sys.stdout.flush()
  print('Drone is taking off')
  sys.stdout.flush()
  drone.simple_takeoff(target_altitude)
  
  while True:
    print('Current Altitude:', drone.location.global_relative_frame.alt)
    sys.stdout.flush()
    # Break and return from function just below target altitude.
    if drone.location.global_relative_frame.alt >= target_altitude * 0.95:
      print('Target altitude reached')
      sys.stdout.flush()
      break
    time.sleep(1)

#creates a position and tells the drone to fly to those coords
def go_to(args):
  global drone
  lat = float(args[1])
  long = float(args[2])

  if(len(args) < 4):
    drone.airspeed = 10
  else:
    drone.airspeed = args[3]

  print('Going to destination...')
  point1 = LocationGlobalRelative(lat, long, 13)
  drone.simple_goto(point1)
  sys.stdout.flush()

# get input from user 
print("Commands (Arguments are comma seperated):")
print("Connect: `CONNECT,<UDP PORT>` - connects to the drone")
print("Disconnect: `DISCONNECT` - disconnects the drone")
print("Cancel: `CANCEL` - cancels the drones flight")
print("Go to point: `GO_TO_POINT,<latitude>, <longitude>` - cancels the drones flight")
print("Arm the drone: `ARM` - Arms the drone and lets it takeoff to a height of 10m")
line = sys.stdin.readline()

while line != "-1\n":
  parsedLine = line.split(",")
  parsedLine[len(parsedLine) - 1] = parsedLine[len(parsedLine) - 1].rstrip()

  switch = {
    CONNECT: connect_to_drone,
    DISCONNECT: disconnect_drone,
    CANCEL: return_to_base,
    GO_TO_POINT: go_to,
    ARM: arm
  }

  execute = switch.get(parsedLine[0], invalid)
  execute(parsedLine)

  line = sys.stdin.readline()
