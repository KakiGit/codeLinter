#include "classes.cpp"
/**
 *
 * watchDog that might be used to exit when the programme halts.
 *
 */
void watchDog(int &i)
{
  i++;
  if (i > 1000)
    exit(0);
}
/**
 *
 * splitPath to get directory name and file name
 *
 */
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
/**
 *
 *
 * read all files in a directory
 *
 */
void read_directory(const string &name, vector<string> &v)
{
  auto isDirectory = [](const char *path) {
    struct stat statbuf;
    if (stat(path, &statbuf) != 0)
      return false;
    return S_ISDIR(statbuf.st_mode);
  };

  DIR *dirp = opendir(name.c_str());
  struct dirent *dp;
  while ((dp = readdir(dirp)) != NULL)
  {
    // if (!(dp->d_type & DT_DIR)) v.push_back(name + '/' + dp->d_name);
    if ((isDirectory((name + '/' + dp->d_name).c_str())) && (strcmp(dp->d_name, ".")) &&
        (strcmp(dp->d_name, "..")))
    {
      v.push_back(name + '/' + dp->d_name);
      read_directory(name + '/' + dp->d_name, v);
    }
    // cout << "name: " << dp->d_name << endl;
    // cout << "type: " << dp->d_type << endl;
    // if (strcmp(dp->d_name, ".") || strcmp(dp->d_name, ".."))
    //   read_directory(dp->d_name, v);
  }
  closedir(dirp);
}
/**
 *
 * find relied files in a file.
 *
 */
void findReliedFiles(string str, AFile &aFile)
{
  regex regNote("\\s*(\\/|\\*).*"),
      fileExp("#include\\s*(<|\"|')(.*)(>|\"|')\\s*");
  smatch sm;
  if (regex_search(str, sm, fileExp))
    if (!regex_match(str, regNote))
      if (!aFile.isAdded(sm[2]))
      {
        aFile.addReliedFiles(sm[2]);
      }
}
/**
 *
 * find functions defined in a files
 *
 */

bool findFuncs(string str, AFile &aFile, int count)
{
  regex regNote("\\s*(\\/|\\*).*"),
      regFunc("([a-z]+)\\s+([a-z]+\\w*)\\s*\\(.*\\)(?=(\\s*\\{))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
    {
      // cout << str << endl;
      // cout << sm[2] << endl;
      string s = sm[0];
      aFile.addMyFunc(s, count);
      return true;
    }
  return false;
}
/**
 *
 * find functions used by a function
 * if this line has a function in aFile adding it to aFunc
 */
void findUsedFuncs(string funcName, string str, AFile &aFile)
{
  regex regNote("\\s*(\\/|\\*).*"),
      regFunc("(\\s+|\\.)([a-z]+\\w*)\\s*\\(.*\\)");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  string s;
  auto searchFunc = [&](string str) -> bool {
    if (regex_search(str, sm, regFunc))
      if (!regex_match(str, regNote))
        // cout << "note passed" << endl;
        if (!notIncluded.count(sm[2]))
        {
          s = sm[2];
          // for (int i = 0; i < sm.length(); i++)
          //   cout << sm[i] << endl;
          return true;
        }
    return false;
  };
  if (searchFunc(str))
  {
    // cout << line << endl;
    // cout << "add " << sm[2] << " to " << funcName << endl;
    // cout << sm[2] << endl;
    aFile.addFuncsInDef(funcName, s);
  }
}

/**
 *
 * find the codes in the definition of a function
 * between {}
 */
void findFuncDefStr(int total, string path, AFile &aFile)
{
  map<int, string> mapOfFuncs = aFile.getMapOfMyFunc();
  int count = 0;
  string str;
  ifstream infile;
  smatch sm;
  infile.open(path);
  map<int, string>::iterator v = mapOfFuncs.begin();
  while (getline(infile, str))
  {
    count++;
    if (count == v->first)
    {
      string funcName = v->second;
      v++;
      int nextCount, numsLine;
      if (v != mapOfFuncs.end())
      {
        nextCount = v->first;
      }
      else
      {
        nextCount = total;
      }
      numsLine = nextCount - count - 1;
      for (int i = 0; i < numsLine; i++)
      {
        getline(infile, str);
        count++;
        findUsedFuncs(funcName, str, aFile);
      }
    }
  }
  infile.close();
}
/**
 *
 * find all reliances of a file
 *
 */
void findReliances(string filePath, int depth, int width)
{
  ifstream infile;
  infile.open(filePath);
  if (infile)
  {
    int count = 0;
    depth++;
    cout << "Analysing: " << filePath << endl
         << endl;
    string str;
    AFile aFile(filePath);

    auto searchDef = [&]() {
      while (getline(infile, str))
      {
        ++count;
        string twoLines;
        twoLines = str;
        findReliedFiles(str, aFile);
        findFuncs(str, aFile, count);

        if (getline(infile, str))
        {
          ++count;
          findReliedFiles(str, aFile);
          if (!findFuncs(str, aFile, count))
            twoLines = twoLines + str;
          findFuncs(twoLines, aFile, count - 1);
        }
        else
          break;
      }
      infile.close();
    };

    searchDef();

    count = 0;
    infile.open(filePath);
    getline(infile, str);
    ++count;
    searchDef();

    aFile.copyTomyFunc();

    findFuncDefStr(count, filePath, aFile);

    aFile.displayReliedFiles(depth, width);
    aFile.displayMyFunctions();

    cout << "There are " << count << " lines in " << filePath << endl
         << endl;

    string dir, ownname;
    splitPath(filePath, dir, ownname);
    vector<string> dirs;
    dirs.push_back(dir);
    read_directory(dir, dirs);
    int width = 0;
    for (vector<AFile>::iterator it = aFile.reliedFiles.begin();
         it != aFile.reliedFiles.end(); it++)
    {
      string path;
      for (int i = 0; i < dirs.size(); i++)
      {
        path = dirs[i] + "/" + it->myName;
        infile.open(path);

        if (infile)
        {
          width++;
          infile.close();
          findReliances(path, depth, width);
        }
      }
    }
  }
}

int main(int argc, char *argv[])
{
  if (argc >= 2)
  {
    int depth = 0;
    int width = 1;
    findReliances(argv[1], depth, width);
  }

  // cout << "Argument number: " << argc << endl;
  // for (int i = 0; i < argc; i++) cout << "Arguments: " << argv[i] << endl;
  return 0;
}
