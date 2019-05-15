#ifndef FRAME_CALC_H
#define FRAME_CALC_H
#include <string>
#include <iostream>
using namespace std;
struct rtime {
	int one = 0;
	int two = 0;
	int three = 0;
	int four = 0;
};
class FrameCalc {
	public:
		FrameCalc(string filename, int videoLength); // in seconds
		void exec(bool runTerminalCommands = false);
	private:
		string filename;
		int videoLength;
		string newDir;
		rtime currentVideoTime;


		void makeDir(bool runTerminalCommands);
		void getNext(rtime & t);
};



#endif
