# Object Recognition

Compiling darknet:
```
$ cd darknet_
$ make
```
Compiling yolo-mark.
```
$ cd yolo-mark
$ make
```
Compile Frame Extractor
```
$ cd frame-extractor
$ make
```
Download Scraped images from drive.
```
TODO:
$ cd darknet_/data/animal-pictures
$ wget …
$ unzip 
```
Using yolo-mark.
```
$ cd darknet_/training
$ ./mark-boxes
```

Train on marked-data.
```
$ cd darknet_/training
$ ./train-model
```

Using frame-extractor 
```
$ cd frame-extractor
$ ./vid2frames <filename.mp4> <length in seconds> <y/n>
$ cd <filename>_frames
```
Note: Make sure the video file is in the same directory as vid2frames
