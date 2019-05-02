# Follow Me Drones

## 5 Guys 1 Branch

### Object Recognition with Darknet

================

<a href="https://github.com/cos301-2019-se/Follow-Me-Drones" target="_blank">Project Github Repository</a> <br> 

<a href="https://github.com/5-guys-1-branch/capstone-documentation" target="_blank">Documentation Github Repository</a> <br>

<a href="https://app.zenhub.com/workspaces/follow-me-drones-5cc8ba6d17cad12342431a8c/board?repos=182156295" target="_blank">Project Management Tool</a> 

### The Team

![alt text](https://i.imgur.com/H8qoSik.jpg "Logo Title Text 1")

Devon
Francois
Brendon
Gilad
Len

# Steps to setup

https://pjreddie.com/darknet/yolo/
https://pjreddie.com/darknet/install/#cuda

1 ->    git clone https://github.com/pjreddie/darknet

2 ->    cd darknet

3 ->    make

4 -> Download the weights

        wget https://pjreddie.com/media/files/yolov3.weights 

    OR for tiny weights 
       
        wget https://pjreddie.com/media/files/yolov3-tiny.weights

5 -> To run the detector

        ./darknet detect cfg/yolov3.cfg yolov3.weights data/dog.jpg

                                Short for

        ./darknet detector test cfg/coco.data cfg/yolov3.cfg yolov3.weights data/dog.jpg

6 -> Can change the threshold

        ./darknet detect cfg/yolov3.cfg yolov3.weights data/dog.jpg -thresh 0

7 -> Running tiny YOLOv3

        ./darknet detect cfg/yolov3-tiny.cfg yolov3-tiny.weights data/dog.jpg

