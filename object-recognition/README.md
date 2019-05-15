# Object Recognition

Compiling darknet:
```
$ cd src/darknet_
$ make
```
Compiling yolo-mark.
```
$ cd src/yolo-mark
$ make
```
Compile Frame Extractor
```
$ cd src/frame-extractor
$ make
```
Download Scraped images from drive.
```
TODO:
$ cd src/darknet_/data/animal-pictures
$ wget …
$ unzip 
```

Using frame-extractor 
```
$ cd frame-extractor
$ ./vid2frames <filename.mp4> <length in seconds> <y/n>
$ cd <filename>_frames
```
Note: Make sure the video file is in the same directory as vid2frames
