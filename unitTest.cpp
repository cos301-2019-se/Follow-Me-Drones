#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>

using namespace std;

string exec(string cmd) 
{
    //Compile and run the detector while outputting the stream to exec.txt
    cmd += " >exec.txt 2>&1";
    system(cmd.c_str());

    //Open the input file with a list of tokens
    ifstream myfile("exec.txt");
    string ret;

    if(myfile.is_open())
    {
        stringstream stream;

        stream << myfile.rdbuf(); //read the file
        ret = stream.str(); //str holds the content of the file

        myfile.close();
    }
    else
        cout << "Unable to open file" << endl;

    return ret;
}

vector<string> getObjectsIdentified(string str)
{
    stringstream ss(str);
    string to;

    vector<string> ret;

    while(getline(ss,to,'\n'))
    {
        if(to.find("%") != string::npos)
            ret.push_back(to.substr(0, to.find(':')));
    }

    return ret;
}

void compareResults(vector<string> detections, vector<string> expectedDetections, string pic)
{
    cout << "\n=============================" << endl;
    cout << "Unit test for -> " << pic << endl;
    cout << "=============================" << endl << endl;;

    for(int i = 0; i < expectedDetections.size(); i++)
    {
        if(find(detections.begin(), detections.end(), expectedDetections[i]) != detections.end())
            cout << "Successfully found: " << detections[i] << endl;
        else
            cout << "Couldn't find: " << expectedDetections[i] << endl;
    }
    
}

int main()
{
    vector<string> pics;
    
    vector<vector<string>> expectedDetections;
    
    pics.push_back("dog.jpg");
    expectedDetections.push_back({"dog", "truck", "bicycle"});

    pics.push_back("eagle.jpg");
    expectedDetections.push_back({"bird"});
/*
    pics.push_back("giraffe.jpg");
    expectedDetections.push_back({"giraffe", "zebra"});

    pics.push_back("horses.jpg");
    expectedDetections.push_back({"horse"});

    pics.push_back("kite.jpg");
    expectedDetections.push_back({"person", "kite"});

    pics.push_back("person.jpg");
    expectedDetections.push_back({"person", "horse", "dog"});
*/
    string output;
    string* objectsIdentified;

    for(int i = 0; i < pics.size(); i++)
    {
        output = exec("./darknet detect cfg/yolov3.cfg yolov3.weights data/" + pics[i]);

        compareResults(getObjectsIdentified(output), expectedDetections[i], pics[i]);
    }

    return 0;
}