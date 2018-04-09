#include <iostream>
#include <string>
#include <regex>
#include <fstream>
#include <vector>
#include <set>

using namespace std;

class AFile
{
  private:
    string myName;
    vector<AFile> reliedFiles;
    set<string> myFunctions;

  public:
    AFile(string name)
    {
        myName = name;
    }
    void addReliedFiles(string name)
    {
        AFile relied(name);
        reliedFiles.push_back(relied);
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
        cout << endl << endl;
    }
    void displayMyFunctions()
    {
        cout << "Contained Functions:" << endl;
        for (set<string>::iterator v = myFunctions.begin(); v != myFunctions.end(); v++)
        {
            cout << *v << endl;
        }
        cout << endl << endl;
    }
};

void SplitPath(const string &str)
{
    size_t found;
    cout << "Splitting: " << str << endl;
    found = str.find_last_of("/\\");
    cout << " folder: " << str.substr(0, found) << endl;
    cout << " file: " << str.substr(found + 1) << endl;
}

void findReliedFiles(string str, AFile &afile)
{
    regex regNote("\\s*(\\/|\\*).*"), fileExp("#include\\s*(<|\"|')(.*)(>|\"|')\\s*");
    smatch sm;
    if (regex_search(str, sm, fileExp))
        if (!regex_match(str, regNote))
            afile.addReliedFiles(sm[2]);
}


void findFuncs(string str, AFile &afile)
{
    regex regNote("\\s*(\\/|\\*).*"), regFunc("[a-z]+\\w*(?=\\s*\\()");
    set<string> notIncluded {"if","for","while","printf","putchar","abs","fclose","fopen","fscanf"};
    smatch sm;
    if (regex_search(str, sm, regFunc))
        if (!regex_match(str, regNote))
            if (!notIncluded.count(sm[0]))
                afile.addMyFunc(sm[0]);
}

void findReliances(string filePath, AFile &afile) {
    ifstream infile;
    // ofstream outfile, subfiles;
    string str;
    // outfile.open("./test.c");
    // subfiles.open("./testSubfiles.c");
    int count = 0;
    infile.open(filePath);
    if (infile)
        while (getline(infile, str))
        {
            ++count;
            findReliedFiles(str, afile);
            findFuncs(str, afile);
        }
    infile.close();
    // outfile.close();
    // subfiles.close();
    afile.displayReliedFiles();
    afile.displayMyFunctions();
    cout << "There are " << count << " lines." << endl;
}

int main(int argc, char *argv[]) 
{
    if(argc>=2)
    {
        AFile afile(argv[1]);
        findReliances(argv[1],afile);
    }
    cout << "Argument number: " << argc << endl;
    for(int i=0;i<argc;i++)
    cout <<  "Arguments: " << argv[i] << endl;
    return 0;
}


