# Drone Controls

## Installing dependencies 

## Prerequisites 
* Git (preferably git bash as well)
* Python3 +
* PIP

# Install
### Installing on Windowns
##### Executing dronekit and mavproxy on windows normally doesnt work as expected
* Option 1 Using Gitbash  
```
	$ cd drone-controls  
	$ ./install.sh  
```
* Option 2 Using CMD/Powershell  
```
	$ cd drone-controls   
	$ sh install.sh  
```
* Option 3 Using Python Commands  
```
	$ pip install dronekit-sitl  
	$ pip install mavproxy  
```

### Installing on Linux
* Option 1 Using terminal 
```
	$ cd drone-controls  
	$ chmod +x install.sh  
	$ ./install.sh  
```
* Option 2 Using Python Commands 
```
	$ pip install dronekit-sitl  
	$ pip install mavproxy  
```

# Running
```
	//This launches the drone simulator
	$ dronekit-sitl copter --home=-25.882593,28.263991,584,353
	//This adds the command interface
	mavproxy.py --master tcp:127.0.0.1:5760 --out udp:127.0.0.1:14551 --out udp:10.1.2.100:1455
	//This is the custom interface that translates the users command to the mavcomands
	$ python interface.py
```