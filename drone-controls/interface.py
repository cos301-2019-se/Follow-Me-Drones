from __future__ import print_function
from dronekit import connect, VehicleMode, Vehicle, LocationGlobalRelative, mavlink
import time, sys, math

# definitions
CONNECT_UDP = 'CONNECT_UDP'
DISCONNECT_UDP = 'DISCONNECT_UDP'
GO_TO_POINT = 'GO_TO_POINT'
CANCEL_FLIGHT = 'CANCEL_FLIGHT'

drone: Vehicle
home: "global"

#functions
# Connect to drone using UDP
def connect_to_drone(args):
  global drone
  try:
    udp_port = args[1]
    #udp_port = "14551"
    print('Connecting to drone on UDP port: %s' % udp_port)
    drone = connect('udp:127.0.0.1:' + udp_port, wait_ready=True)
    print('CONNECTED')
    sys.stdout.flush()
  except Exception as e:
    print('Error connecting to drone via UDP', e)
    print('FAILURE')
  return

#error function
def invalid(args):
	print('Invalid command')
	sys.stdout.flush()

#disconnect the drone
def disconnect_drone(args):
  global drone
  try:
    drone.close()
    print('Disconnected')
    sys.stdout.flush()
  except Exception as e:
    print('Error disconecting the drone', e)

#cancel the flight
# RTL = return to launch zone
def return_to_base(args):
  global drone
  print("Returning to base")
  drone.mode = VehicleMode("RTL")
  sys.stdout.flush()

#arms the drone and makes it takeoff with a default height of 10m
def arm(alt):
  global drone
  global home

  home = drone.location.global_relative_frame

  print('Performing pre-arm checks...')
  sys.stdout.flush()

  # Don't try to arm until autopilot is ready
  while not drone.is_armable:
    print('Initialization in progress')
    sys.stdout.flush()
    time.sleep(1)

  print('Arming drone')
  sys.stdout.flush()

  # Copter should arm in GUIDED mode
  drone.mode = VehicleMode('GUIDED')
  drone.armed = True

  # Confirm vehicle armed before attempting to take off
  while not drone.armed:
    print('Arming still in progress')
    sys.stdout.flush()
    time.sleep(1)

  # Take off to target altitude
  print('Drone launching...')
  sys.stdout.flush()
  drone.simple_takeoff(alt)

  while True:
    print('Current Altitude:', drone.location.global_relative_frame.alt)
    sys.stdout.flush()
  # Break and return from function just below target altitude.
    if drone.location.global_relative_frame.alt >= alt * 0.95:
      print('Target altitude reached')
      sys.stdout.flush()
      break
    time.sleep(1)

#creates a position and tells the drone to fly to those coords
def go_to_waypoint(args):
  global drone
  lat = float(args[1])
  long = float(args[2])

  if(len(args) < 4):
    arm(10)
  else:
    arm(args[3])

  print('Going to destination...')
  drone.airspeed = 10;
  point1 = LocationGlobalRelative(lat, long, 13)
  drone.simple_goto(point1)
  sys.stdout.flush()

# get input from user 
print("Commands (Arguments are comma seperated):")
print("Connect: `CONNECT_UDP,<UDP PORT>` - connects to the drone")
print("Disconnect: `DISCONNECT_UDP` - disconnects the drone")
print("Cancel: `CANCEL_FLIGHT` - cancels the drones flight")
print("Go to point: `GO_TO_POINT,<latitude>, <longitude>` - cancels the drones flight")
#print("Arm the drone: `ARM` - Arms the drone and lets it takeoff to a height of 10m")
line = sys.stdin.readline()

while line != "-1\n":
  parsedLine = line.split(",")
  parsedLine[len(parsedLine) - 1] = parsedLine[len(parsedLine) - 1].rstrip()

  switch = {
    CONNECT_UDP: connect_to_drone,
    DISCONNECT_UDP: disconnect_drone,
    GO_TO_POINT: go_to_waypoint,
    CANCEL_FLIGHT: return_to_base
  }

  execute = switch.get(parsedLine[0], invalid)
  execute(parsedLine)

  line = sys.stdin.readline()