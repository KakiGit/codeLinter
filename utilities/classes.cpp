#include <dirent.h>
#include <fstream>
#include <iostream>
#include <map>
#include <regex>
#include <set>
#include <string>
#include <vector>
using namespace std;

/**
 *
 * the class of a function. it contains its name and the functions it uses in
 * its definition
 *
 */
class AFunc
{
private:
  string myName;
  vector<string> usedFuncsSequence;
  set<string> usedFuncs;

public:
  /**
   * constructor, giving a name of a function instance
   */
  AFunc(string str) { myName = str; }
  /**
   * returns the name of the function
   */
  string getMyName()
  {
    regex regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
    smatch sm;
    regex_search(myName, sm, regFunc);
    // cout << "getMyName: " << sm[2] << endl;
    return sm[2];
  }
  /**
   * returns the real name of the function
   */
  string getMyRealName() { return myName; }
  /**
   * add functions used by this function
   */
  void addUsedFunc(string str)
  {
    usedFuncsSequence.push_back(str);
    usedFuncs.insert(str);
  }
  /**
   * show used functions on terminal
   */
  void showUsedFunc()
  {
    for (set<string>::iterator v = usedFuncs.begin(); v != usedFuncs.end(); v++)
      cout << *v << endl;
  }
  void showUsedFuncSequence()
  {
    for (vector<string>::iterator v = usedFuncsSequence.begin();
         v != usedFuncsSequence.end(); v++)
      cout << *v << endl;
  }
};

/**
 *
 * the class of a file, it contains the functions it defines and the files it
 * relies on
 *
 */

class AFile
{
private:
  string myName;
  vector<AFile> reliedFiles;
  // set<string> myFunctions;
  map<int, string> myFunctions;
  vector<AFunc> myFunc;

public:
  /**
   * friend function, allowing it to have access to private variables
   */
  friend void findReliances(string filePath, int depth, int width);
  /**
   * constructor
   */
  AFile(string name) { myName = name; }
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
    for (vector<AFile>::iterator v = reliedFiles.begin();
         v != reliedFiles.end(); v++)
    {
      if (v->myName == str)
        return true;
    }
    return false;
  }
  /**
   * add functions it defines
   */
  void addMyFunc(string funcName, int count)
  {
    myFunctions.insert(pair<int, string>(count, funcName));
  }
  /**
   * whether the definition of a function has been added
   */
  bool funcIsAdded(int count, string str)
  {
    regex regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
    smatch sm;
    map<int, string>::iterator v = myFunctions.find(count);
    if (v != myFunctions.end())
    {
      regex_search(myFunctions.at(count), sm, regFunc);
      if (sm[2] == str)
        return true;
    }
    return false;
  }
  void addFuncsInDef(string funcName, string usedFunc)
  {
    vector<AFunc>::iterator it =
        find_if(myFunc.begin(), myFunc.end(),
                [&](AFunc &aFunc) { return aFunc.getMyName() == funcName; });
    if (it != myFunc.end())
    {
      // cout << "iterator found" << endl
      //      << " funcName: " << funcName << endl
      //      << "usedFunc:" << usedFunc << endl;
      it->addUsedFunc(usedFunc);
    }
  }
  /**
   * display its relied files
   */
  void displayReliedFiles(int depth, int width)
  {
    cout << "[" << depth << "-" << width << "]" << endl;
    cout << "Relied Files:" << endl;
    for (vector<AFile>::iterator v = reliedFiles.begin();
         v != reliedFiles.end(); v++)
    {
      cout << v->myName << endl;
    }
    cout << endl;
  }
  /**
   * display functions it defines
   */
  void displayMyFunctions()
  {
    cout << "Contained Functions:" << endl;
    for (map<int, string>::iterator v = myFunctions.begin();
         v != myFunctions.end(); v++)
    {
      cout << ">" << (*v).second << " in line " << (*v).first << endl;
      // cout << "Used Functions: " << endl;
      //      << "例子1 defined in file 1" << endl
      //      << "例子2 defined in file 2" << endl
      //      << "例子3 defined in file 3" << endl;
      displayUsedFuncs((*v).second);
      cout << "<" << endl;
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
      if (v->getMyRealName() == str)
        v->showUsedFunc();
    }
  }
  /**
   * create function instances
   */
  void copyTomyFunc()
  {
    for (map<int, string>::iterator v = myFunctions.begin();
         v != myFunctions.end(); v++)
    {
      AFunc aFunc((*v).second);
      myFunc.push_back(aFunc);
    }
  }

  void displayFuncSequence()
  {
    for (vector<AFunc>::iterator v = myFunc.begin(); v != myFunc.end(); v++)
    {
      v->showUsedFuncSequence();
    }
  }
};