from __future__ import print_function
from dronekit import connect, VehicleMode, Vehicle, LocationGlobalRelative, mavlink
import time
import sys
import math

# definitions
CONNECT = 'CONNECT'
DISCONNECT_UDP = 'DISCONNECT_UDP'
GO_TO_POINT = 'GO_TO_POINT'
CANCEL_FLIGHT = 'CANCEL_FLIGHT'

drone: Vehicle
home: "global"

#functions
# Connect to drone using UDP
def connect_to_drone(arguments):
  global drone
  try:
    udp_port = arguments[1]
    #udp_port = "14551"
    print('Connecting to drone on UDP port: %s' % udp_port)
    drone = connect('udp:127.0.0.1:' + udp_port, wait_ready=True)
    print('CONNECT_UDP: SUCCESS')
    sys.stdout.flush()
  except Exception as e:
    print('Error connecting to drone via UDP', e)
    print('CONNECT_UDP: FAILURE')
  return

def invalid(arguments):
	print("Invalid command")
	sys.stdout.flush()

# get input from user 
print("Commands (Arguments are comma seperated): \n CONNECT[,Args1,...]")
line = sys.stdin.readline()

while line != "-1\n":
  parsedLine = line.split(",")
  parsedLine[len(parsedLine) - 1] = parsedLine[len(parsedLine) - 1].rstrip()

  switch = {
    CONNECT: connect_to_drone,
    #DISCONNECT_UDP: disconnect_drone,
    #GO_TO_POINT: go_to_waypoint,
    #CANCEL_FLIGHT: cancel_flight
  }

  execute = switch.get(parsedLine[0], invalid)
  execute(parsedLine)

  line = sys.stdin.readline()
