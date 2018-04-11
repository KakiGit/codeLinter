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

/**
 * 
 * the class of a function. it contains its name and the functions it uses in its definition
 * 
 */
class AFunc
{
    private:
    string myName;
    vector<string> usedFunc;

    public:
    /**
     * constructor, giving a name of a function instance
 */
    AFunc(string str)
    {
        myName = str;
    }
    /**
     * returns the name of the function
 */
    string getMyName()
    {
        return myName;
    }
    /**
     * add functions used by this function
 */
    void addUsedFunc(string str)
    {
        usedFunc.push_back(str);
    }
    /**
     * show used functions on terminal
 */
    void showUsedFunc()
    {
        for(vector<string>::iterator v = usedFunc.begin(); v!=usedFunc.end();v++)
        cout << *v << endl;
    }
};

/**
 * 
 * the class of a file, it contains the functions it defines and the files it relies on
 * 
 */

class AFile
{
  private:
    string myName;
    vector<AFile> reliedFiles;
    // set<string> myFunctions;
    map<int,string> myFunctions;
    vector<AFunc> myFunc;

  public:
  /**
   * friend function, allowing it to have access to private variables
 */
    friend void findReliances(string filePath);
    /**
     * constructor
 */
    AFile(string name)
    {
        myName = name;
    }
    /**
     * add relied files
 */
    void addReliedFiles(string name)
    {
        AFile relied(name);
        reliedFiles.push_back(relied);
    }
    /**
     * whether the relied file name has been added before
 */
    bool isAdded(string str)
    {
        for(vector<AFile>::iterator v = reliedFiles.begin();v!=reliedFiles.end();v++)
        {
            if(v->myName==str)
            return true;
        }
        return false;
    }
    /**
     * add functions it defines
 */
    void addMyFunc(string funcName, int count)
    {
        myFunctions.insert(pair<int,string>(count,funcName));
    }
    /**
     * display its relied files
 */
    void displayReliedFiles()
    {
        cout << "Relied Files:" << endl;
        for (vector<AFile>::iterator v = reliedFiles.begin(); v != reliedFiles.end();v++)
        {
            cout << v->myName <<endl;
        }
        cout << endl ;
    }
    /**
     * display functions it defines
 */
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
    /**
     * displays functions the defined functions uses
 */
    void displayUsedFuncs(string str)
    {
        for (vector<AFunc>::iterator v = myFunc.begin(); v != myFunc.end(); v++)
        {
            if(v->getMyName()==str)
            v->showUsedFunc();
        }
    }
    /**
     * create function instances
 */
    void copyTomyFunc()
    {
        for (map<int,string>::iterator v = myFunctions.begin(); v != myFunctions.end(); v++)
        {
            AFunc aFunc((*v).second);
            myFunc.push_back(aFunc);
        }
    }
};