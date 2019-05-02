## Object Recognition with Darknet

================

### Steps to setup

https://pjreddie.com/darknet/yolo/
https://pjreddie.com/darknet/install/#cuda

1) Clone the git repository

        git clone https://github.com/pjreddie/darknet

2) Move to the directory

        cd darknet

3) Make the project

        make
        
4) Download the weights

        wget https://pjreddie.com/media/files/yolov3.weights 

    OR for tiny weights 
       
        wget https://pjreddie.com/media/files/yolov3-tiny.weights

5) To run the detector

        ./darknet detect cfg/yolov3.cfg yolov3.weights data/dog.jpg

                                Short for

        ./darknet detector test cfg/coco.data cfg/yolov3.cfg yolov3.weights data/dog.jpg

6) Can change the threshold

        ./darknet detect cfg/yolov3.cfg yolov3.weights data/dog.jpg -thresh 0

7) Running tiny YOLOv3

        ./darknet detect cfg/yolov3-tiny.cfg yolov3-tiny.weights data/dog.jpg

