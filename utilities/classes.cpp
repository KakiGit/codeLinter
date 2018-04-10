#include <vector>
#include <set>
#include <map>
#include <string>
#include <iostream>
#include <string>
#include <regex>
#include <fstream>
#include <dirent.h>
using namespace std;

class AFunc
{
    private:
    string myName;
    vector<string> usedFunc;

    public:
    AFunc(string str)
    {
        myName = str;
    }
    string getMyName()
    {
        return myName;
    }
    void addUsedFunc(string str)
    {
        usedFunc.push_back(str);
    }
    void showUsedFunc()
    {
        for(vector<string>::iterator v = usedFunc.begin(); v!=usedFunc.end();v++)
        cout << *v << endl;
    }
};

class AFile
{
  private:
    string myName;
    vector<AFile> reliedFiles;
    // set<string> myFunctions;
    map<int,string> myFunctions;
    vector<AFunc> myFunc;

  public:
    friend void findReliances(string filePath);
    AFile(string name)
    {
        myName = name;
    }
    void addReliedFiles(string name)
    {
        AFile relied(name);
        reliedFiles.push_back(relied);
    }
    bool isAdded(string str)
    {
        for(vector<AFile>::iterator v = reliedFiles.begin();v!=reliedFiles.end();v++)
        {
            if(v->myName==str)
            return true;
        }
        return false;
    }
    void addMyFunc(string funcName, int count)
    {
        myFunctions.insert(pair<int,string>(count,funcName));
    }
    void displayReliedFiles()
    {
        cout << "Relied Files:" << endl;
        for (vector<AFile>::iterator v = reliedFiles.begin(); v != reliedFiles.end();v++)
        {
            cout << v->myName <<endl;
        }
        cout << endl ;
    }
    void displayMyFunctions()
    {
        cout << "Contained Functions:" << endl;
        for (map<int,string>::iterator v = myFunctions.begin(); v != myFunctions.end(); v++)
        {
            cout << (*v).second << " in line " << (*v).first << endl;
            cout << "Used Functions: " << endl << "例子1" << endl << "例子2" << endl << "例子3" << endl;
            displayUsedFuncs((*v).second);
        }
        cout << endl;
    }
    void displayUsedFuncs(string str)
    {
        for (vector<AFunc>::iterator v = myFunc.begin(); v != myFunc.end(); v++)
        {
            if(v->getMyName()==str)
            v->showUsedFunc();
        }
    }
    void copyTomyFunc()
    {
        for (map<int,string>::iterator v = myFunctions.begin(); v != myFunctions.end(); v++)
        {
            AFunc aFunc((*v).second);
            myFunc.push_back(aFunc);
        }
    }
};