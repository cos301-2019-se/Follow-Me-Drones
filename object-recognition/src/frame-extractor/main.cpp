#include <iostream>
#include <string>
#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <array>
#include "frameCalc.h"
using namespace std;
int main(int argc, char * argv[]) {
	string filename;
	int videoLength = 0;
	string exec = "";
	filename = argv[1];
	videoLength = atoi(argv[2]);
	if(argc > 3) {
		exec = argv[3];
	}
	FrameCalc * calc = new FrameCalc(filename,videoLength);
	calc->exec(exec == "y" ? true : false);
	return 0;
}



