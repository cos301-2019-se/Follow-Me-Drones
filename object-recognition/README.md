# Object Recognition

Compile darknet:
```
$ cd src/darknet_
$ make
```
Download the weights
```
$ Navigate to the backup folder within darknet_
$ wget ...
```
Compile yolo-mark.
```
$ cd src/yolo-mark
$ cmake .
$ make
```
Compile Frame Extractor
```
$ cd src/frame-extractor
$ make
```
To open the terminal user interface
```
$ Navigate into the interface directory
$ make
$ make run
```
To mark images
```
TODO:
$ Place images you wish to mark in in darknet_/data/animal-pictures directory
$ Open the user interface
$ Selection option 3 to mark the images
```
To train the detector
```
$ Open the user interface
$ s
```
Using frame-extractor 
```
$ cd frame-extractor
$ ./vid2frames <filename.mp4> <length in seconds> <y/n>
$ cd <filename>_frames
```
Note: Make sure the video file is in the same directory as vid2frames
