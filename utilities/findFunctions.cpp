#include "classes.cpp"
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
  DIR *dirp = opendir(name.c_str());
  struct dirent *dp;
  while ((dp = readdir(dirp)) != NULL)
  {
    // if (!(dp->d_type & DT_DIR)) v.push_back(name + '/' + dp->d_name);
    if ((dp->d_type & DT_DIR) && (strcmp(dp->d_name, ".")) &&
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
  regex regNote("\\s*(\\/|\\*)(\\s|\\S)*"),
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
  regex regNote("\\s*(\\/|\\*)(\\s|\\S)*"),
      regFunc("([a-z]+)\\s+([a-z]+\\w*)\\s*\\(.*\\)(?=(\\s*\\{)))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
    {
      // cout << str << endl;
      // cout << sm[2] << endl;
      aFile.addMyFunc(sm[0], count);
      return true;
    }
  return false;
}
/**
 *
 * find functions used by a function
 * if this line has a function in aFile adding it to aFunc
 */
void findUsedFuncs(string funcName, string code, AFile &aFile)
{
  regex regNote("\\s*(\\/|\\*)(\\s|\\S)*"),
      regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  auto searchFunc = [=, &sm](string str) -> bool {
    if (regex_search(str, sm, regFunc))
      if (!regex_match(str, regNote))
        // cout << "note passed" << endl;
        if (!notIncluded.count(sm[2]))
        {
          // cout << str << endl;
          return true;
        }
    return false;
  };
  auto readLine = [&](string str) {
    char c;
    string line;
    for (int i = 0; i < str.length(); i++)
    {
      c = str.at(i);
      line = line + c;
      if (c == '\n')
      {
        if (searchFunc(line))
        {
          // cout << line << endl;
          // cout << "add " << sm[2] << " to " << funcName << endl;
          // cout << sm[2] << endl;
          aFile.addFuncsInDef(funcName, sm[2]);
        }
        line.clear();
      }
    }
  };
  readLine(code);
}

/**
 * find the beginning of a code definition
 */
bool findFuncDefBegin(string &funcName, int count, string str, AFile &aFile)
{
  regex regNote("\\s*(\\/|\\*)(\\s|\\S)*"),
      regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
      if (!notIncluded.count(sm[2]))
        if (aFile.funcIsAdded(count, sm[2]))
        {
          // cout << "function Name: " << sm[2] << endl;
          // cout << "code line: " << str << endl;
          funcName = sm[2];
          return true;
        }
  return false;
}

/**
 *
 * find the codes in the definition of a function
 * between {}
 */
void findFuncDefStr(string path, AFile &aFile, string &code)
{
  int count = 0;
  string str;
  ifstream infile;
  regex e("\\{");
  smatch sm;
  infile.open(path);
  while (getline(infile, str))
  {
    string funcName;
    count++;
    if (findFuncDefBegin(funcName, count, str, aFile))
    {
      int symCount = 0;
      char c;
      if (regex_search(str, sm, e))
        symCount++;
      else
      {
        while (symCount == 0)
        {
          infile.get(c);
          if (c == '\n')
            count++;
          if (c == '{')
            symCount++;
        }
      }
      while (symCount != 0)
      {
        infile.get(c);
        if (c == '{')
          symCount++;
        if (c == '}')
          symCount--;

        if (c == '\n')
          count++;
        code = code + c;
      }
      // cout << str << endl;
      findUsedFuncs(funcName, code, aFile);
      // cout << code << endl;

      code.clear();
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
    depth++;
    cout << "Analysing: " << filePath << endl
         << endl;
    string str;
    AFile aFile(filePath);
    int count = 0;

    while (getline(infile, str))
    {
      ++count;
      string twoLines;
      twoLines = str;
      findReliedFiles(str, aFile);
      if (!findFuncs(twoLines, aFile, count))
      {
        if (getline(infile, str))
        {
          ++count;
          findReliedFiles(str, aFile);
          if (!findFuncs(str, aFile, count))
          {
            twoLines = twoLines + "\n" + str;
            findFuncs(twoLines, aFile, count - 1);
          }
        }
        else
          break;
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
      findReliedFiles(str, aFile);
      if (!findFuncs(twoLines, aFile, count))
      {
        if (getline(infile, str))
        {
          ++count;
          findReliedFiles(str, aFile);
          if (!findFuncs(str, aFile, count))
          {
            twoLines = twoLines + "\n" + str;
            findFuncs(twoLines, aFile, count - 1);
          }
        }
        else
          break;
      }
    }
    infile.close();

    aFile.copyTomyFunc();
    string code;
    findFuncDefStr(filePath, aFile, code);

    // int width = 0;
    aFile.displayReliedFiles(depth, width);
    aFile.displayMyFunctions();

    string dir, ownname;
    splitPath(filePath, dir, ownname);
    vector<string> dirs;
    dirs.push_back(dir);
    read_directory(dir, dirs);
    cout << "There are " << count << " lines in " << filePath << endl
         << endl;

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
