#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
	const string LIST_FILE = "./../rhino_2000.list";
	const string IMG_PREFIX = "rhino";
	const string FILENAME = "rhino_800";
	const int FIRST_IMAGE = 0;
	const bool DOWNLOAD = false;

	string mk = "mkdir " + FILENAME;
	system(mk.c_str());
	ifstream file;
	file.open(LIST_FILE);
	int line_count = 0;
	vector<string> url;

	for(int i = 0; i < FIRST_IMAGE; i++) {
		string temp;
		file>>temp;
		/* url.push_back(temp); */
	}

	for(int i = 0; i < 100; i++) {
		string temp;
		file>>temp;
		url.push_back(temp);
	}


	for(int i = FIRST_IMAGE; i < FIRST_IMAGE + 100; i++) {
		string command = "wget -O ";
		command += FILENAME + "/" + IMG_PREFIX + "-" + to_string(i)+ ".jpg";
		command += " \"" + url[i % 100] + "\"";
		if(DOWNLOAD) {
			system(command.c_str());
		}
		else {
			cout << command << endl;
		}
	}

	cout << '\a';
	cout << '\a';
	cout << '\a';
	cout << '\a';
	cout << '\a';

}

