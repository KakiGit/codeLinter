#include "classes.cpp"

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
            {
                afile.addReliedFiles(sm[2]);
            }
}


bool findFuncs(string str, AFile &afile, int count)
{
    regex regNote("\\s*(\\/|\\*).*"), regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)\\s*\\{))");
    set<string> notIncluded {"if","for","while"};
    smatch sm;
    if (regex_search(str, sm, regFunc))
        if (!regex_match(str, regNote))
            if (!notIncluded.count(sm[2]))
            {
                // cout << str << endl;
                // cout << sm[2] << endl;
                afile.addMyFunc(sm[2],count);
                return true;
            }
    return false;
}

bool findUsedFuncs(string str, AFunc &aFunc)
{
    regex regNote("\\s*(\\/|\\*).*"), regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
    set<string> notIncluded {"if","for","while"};
    smatch sm;
    if (regex_search(str, sm, regFunc))
        if (!regex_match(str, regNote))
            if (!notIncluded.count(sm[2]))
            {
                // cout << str << endl;
                // cout << sm[2] << endl;
                aFunc.addUsedFunc(sm[2]);
                return true;
            }
    return false;
}

// void findFuncDef(string str)
// {
//      while (getline(infile, str))
//         {
//             ++count;
//             string twoLines;
//             twoLines = str;
//             findReliedFiles(str, afile);
//             if(getline(infile, str))
//             {
//                 ++count;
//                 findReliedFiles(str, afile);
//                 twoLines = twoLines + "\n" + str;
//             }
//             else break;
//             findFuncs(twoLines, afile);
//         }
//         infile.close();
// }


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
    
        while (getline(infile, str))
        {
            ++count;
            string twoLines;
            twoLines = str;
            findReliedFiles(str, afile);
            if(!findFuncs(twoLines, afile, count))
            {
            if(getline(infile, str))
            {
                ++count;
                findReliedFiles(str, afile);
                if(!findFuncs(str, afile, count))
                {
                    twoLines = twoLines + "\n" + str;
                    findFuncs(twoLines, afile, count-1);
                }
            }
            else break;
            }
        }
        infile.close();
        count = 0;
        infile.open(filePath);
        getline(infile, str);
        ++count;
        while (getline(infile, str))
        {
            ++count;
            string twoLines;
            twoLines = str;
            findReliedFiles(str, afile);
            if(!findFuncs(twoLines, afile, count))
            {
            if(getline(infile, str))
            {
                ++count;
                findReliedFiles(str, afile);
                if(!findFuncs(str, afile, count))
                {
                    twoLines = twoLines + "\n" + str;
                    findFuncs(twoLines, afile, count-1);
                }
            }
            else break;
            
            }
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


