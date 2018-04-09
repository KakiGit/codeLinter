#include <iostream>
#include <string>
#include <regex>
#include <fstream>
#include <vector>
#include <set>
#include <dirent.h>

using namespace std;

class AFile
{
  private:
    string myName;
    vector<AFile> reliedFiles;
    set<string> myFunctions;

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
    void addMyFunc(string funcName)
    {
        myFunctions.insert(funcName);
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
        for (set<string>::iterator v = myFunctions.begin(); v != myFunctions.end(); v++)
        {
            cout << *v << endl;
        }
        cout << endl;
    }
};

void splitPath(const string &str, string &dir, string &ownname)
{
    size_t found;
    // cout << "Splitting: " << str << endl;
    found = str.find_last_of("/\\");
    dir = str.substr(0, found);
    ownname = str.substr(found + 1);
    // cout << " folder: " << str.substr(0, found) << endl;
    // cout << " file: " << str.substr(found + 1) << endl;
}

void read_directory(const string &name, vector<string> &v)
{
    DIR* dirp = opendir(name.c_str());
    struct dirent * dp;
    while ((dp = readdir(dirp)) != NULL) {
        v.push_back(dp->d_name);
    }
    closedir(dirp);
}

void findReliedFiles(string str, AFile &afile)
{
    regex regNote("\\s*(\\/|\\*).*"), fileExp("#include\\s*(<|\"|')(.*)(>|\"|')\\s*");
    smatch sm;
    if (regex_search(str, sm, fileExp))
        if (!regex_match(str, regNote))
        if(!afile.isAdded(sm[2]))
            afile.addReliedFiles(sm[2]);
}


void findFuncs(string str, AFile &afile)
{
    regex regNote("\\s*(\\/|\\*).*"), regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)\\s*\\{))");
    set<string> notIncluded {"if","for","while","printf","putchar","abs","fclose","fopen","fscanf"};
    smatch sm;
    if (regex_search(str, sm, regFunc))
        if (!regex_match(str, regNote))
            if (!notIncluded.count(sm[2]))
            {
                // cout << str << endl;
                // cout << sm[2] << endl;
                afile.addMyFunc(sm[2]);
            }
}

void findReliances(string filePath) {
    
    ifstream infile;
    infile.open(filePath);
    if(infile)
    {
    cout << "Analysing: " << filePath << endl << endl;    
    // ofstream outfile, subfiles;
    string str;
    AFile afile(filePath);
    string dir,ownname;
    // outfile.open("./test.c");
    // subfiles.open("./testSubfiles.c");
    int count = 0;
    
    if (infile)
        while (getline(infile, str))
        {
            ++count;
            string twoLines;
            twoLines = str;
            findReliedFiles(str, afile);
            if(getline(infile, str))
            {
                ++count;
                findReliedFiles(str, afile);
                twoLines = twoLines + "\n" + str;
            }
            else break;
            findFuncs(twoLines, afile);
        }
        infile.close();
        infile.open(filePath);
        getline(infile, str);
        while (getline(infile, str))
        {
            // ++count;
            string twoLines;
            twoLines = str;
            findReliedFiles(str, afile);
            if(getline(infile, str))
            {
                // ++count;
                findReliedFiles(str, afile);
                twoLines = twoLines + "\n" + str;
            }
            else break;
            findFuncs(twoLines, afile);
        }
    infile.close();
    // outfile.close();
    // subfiles.close();
    afile.displayReliedFiles();
    afile.displayMyFunctions();
    splitPath(filePath, dir, ownname);
    cout << "There are " << count << " lines in " << filePath << endl << endl;
    
    for(vector<AFile>::iterator it = afile.reliedFiles.begin(); it!= afile.reliedFiles.end();it++)
    {
        string path;
        path = dir + "/" + it->myName;
        // cout << "Next path: " << path << endl;
        findReliances(path);
    }
    }
}


int main(int argc, char *argv[]) 
{
    if(argc>=2)
    {
        vector<string> files;
        string dir;
        findReliances(argv[1]);
        // read_directory(dir,files);
        // for(int i=0;i<files.size();i++)
        // {
        //     cout  << " Path: " << files[i] <<endl;
        // }
    }
    // cout << "Argument number: " << argc << endl;
    // for(int i=0;i<argc;i++)
    // cout <<  "Arguments: " << argv[i] << endl;
    return 0;
}


