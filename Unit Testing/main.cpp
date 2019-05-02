#include <cstdio>
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
#include <array>
#include <sstream>

using namespace std;

string* getObjectsIdentified(string str)
{
    stringstream ss(str);
    string to;

    string* ret;

    while(getline(ss,to,'\n'))
    {
        if(to.find("data") != string::npos)
            (*ret) += to + "\n";
    }

    return ret;
}

string exec(string cmd) 
{
    array<char, 128> buffer;
    string result;
    unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd.c_str(), "r"), pclose);

    if (!pipe)
        throw runtime_error("popen() failed!");

    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) 
        result += buffer.data();

    return result;
}

int main()
{
    string* pics = new string[7];
    pics[0] = "dog.jpg";
    pics[1] = "eagle.jpg";
    pics[2] = "giraffe.jpg";
    pics[3] = "horses.jpg";
    pics[4] = "kite.jpg";
    pics[5] = "person.jpg";
    pics[6] = "scream.jpg";

    string** expectedDetections = new string*[7];
    
    string output;
    string* objectsIdentified;

    for(int i = 0; i < pics->size(); i++)
    {
        output = exec("./darknet detect cfg/yolov3.cfg yolov3.weights data/" + pics[i]);

        expectedDetections[i] = getObjectsIdentified(output);
    }

    return 0;
}