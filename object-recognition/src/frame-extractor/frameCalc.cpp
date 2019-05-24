#include "frameCalc.h"

FrameCalc :: FrameCalc(string filename, int videoLength) {
	this->filename = filename;
	this->videoLength = videoLength;
	this->videoLength++;
}
void FrameCalc :: makeDir(bool runTerminalCommands) {
	this->newDir = filename.substr(0, filename.size()-4);
	this->newDir += "_frames";
	cout << newDir << endl;
	string makeDir = "mkdir " + newDir;
	if(runTerminalCommands) {
		system(makeDir.c_str());
	}
}

void FrameCalc :: exec(bool runTerminalCommands) {
	makeDir(runTerminalCommands);
	for(int i = 0; i < videoLength ;i++) {
		string cmd = "ffmpeg -ss ";
		cmd += to_string(currentVideoTime.four);
		cmd += to_string(currentVideoTime.three);
		cmd += ":";
		cmd += to_string(currentVideoTime.two);
		cmd += to_string(currentVideoTime.one);
		cmd +=  " -i " + filename;
		cmd += " -y ";
		cmd  += this->newDir + "/" + "image" + to_string(i) + ".jpg";
		cmd += "> /dev/null 2>&1";
		cout << "cmd: " << cmd << endl;
		if(runTerminalCommands) {
			system(cmd.c_str());
		}
		getNext(currentVideoTime);
	}
}

void FrameCalc :: getNext(rtime & t) {
	div_t res, res1;
	res = div(t.one, 10);
	res1 = div(t.three, 10);
	if(res.rem < 9) {
		++t.one;
	}
	else if(t.two < 5){
		t.one = 0;
		++t.two;
	}
	else if(res1.rem < 9){
		t.one = 0;
		t.two = 0;
		++t.three;
	}
	else {
		t.one = 0;
		t.two = 0;
		t.three = 0;
		++t.four;
	}
}
