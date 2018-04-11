#include "classes.cpp"
/**
 *
 * splitPath to get directory name and file name
 *
 */

void splitPath(const string &str, string &dir, string &ownname) {
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
void read_directory(const string &name, vector<string> &v) {
  DIR *dirp = opendir(name.c_str());
  struct dirent *dp;
  while ((dp = readdir(dirp)) != NULL) {
    v.push_back(dp->d_name);
  }
  closedir(dirp);
}
/**
 *
 * find relied files in a file.
 *
 */
void findReliedFiles(string str, AFile &aFile) {
  regex regNote("\\s*(\\/|\\*).*"),
      fileExp("#include\\s*(<|\"|')(.*)(>|\"|')\\s*");
  smatch sm;
  if (regex_search(str, sm, fileExp))
    if (!regex_match(str, regNote))
      if (!aFile.isAdded(sm[2])) {
        aFile.addReliedFiles(sm[2]);
      }
}
/**
 *
 * find functions defined in a files
 *
 */

bool findFuncs(string str, AFile &aFile, int count) {
  regex regNote("\\s*(\\/|\\*).*"),
      regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)\\s*\\{))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
      if (!notIncluded.count(sm[2])) {
        // cout << str << endl;
        // cout << sm[2] << endl;
        aFile.addMyFunc(sm[2], count);
        return true;
      }
  return false;
}
/**
 *
 * find functions used by a function
 * if this line has a function in aFile adding it to aFunc
 */
bool findUsedFuncs(string str, AFunc &aFunc) {
  regex regNote("\\s*(\\/|\\*).*"),
      regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
      if (!notIncluded.count(sm[2])) {
        // cout << str << endl;
        // cout << sm[2] << endl;
        aFunc.addUsedFunc(sm[2]);
        return true;
      }
  return false;
}

/**
 * find the beginning of a code definition
 */
bool findFuncDefBegin(int count, string str, AFile &aFile) {
  regex regNote("\\s*(\\/|\\*).*"),
      regFunc("(\\s+|\\.)([a-z]+\\w*(?=\\s*\\(.*\\)))");
  set<string> notIncluded{"if", "for", "while"};
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
      if (!notIncluded.count(sm[2]))
        if (aFile.funcIsAdded(count, sm[2])) return true;
  return false;
}

/**
 *
 * find the codes in the definition of a function
 * between {}
 */
void findFuncDefStr(string path, AFile aFile, string &code) {
  int count = 0;
  string str;
  ifstream infile;
  regex e("\\{");
  smatch sm;
  infile.open(path);
  while (getline(infile, str)) {
    count++;
    if (findFuncDefBegin(count, str, aFile)) {
      int symCount = 0;
      char c;
      if (regex_search(str, sm, e))
        symCount++;
      else {
        while (symCount == 0) {
          infile.get(c);
          if (c == '\n') count++;
          if (c == '{') {
            symCount++;
            // cout << symCount << endl;
          }
        }
      }
      while (symCount != 0) {
        infile.get(c);
        if (c == '{') {
          symCount++;
          // cout << symCount << endl;
        }
        if (c == '}') {
          symCount--;
          // cout << symCount << endl;
        }
        if (c == '\n') count++;
        code = code + c;
      }
      cout << str << endl;
      cout << code << endl;
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
void findReliances(string filePath) {
  ifstream infile;
  infile.open(filePath);
  if (infile) {
    cout << "Analysing: " << filePath << endl << endl;
    string str;
    AFile aFile(filePath);
    string dir, ownname;
    int count = 0;

    while (getline(infile, str)) {
      ++count;
      string twoLines;
      twoLines = str;
      findReliedFiles(str, aFile);
      if (!findFuncs(twoLines, aFile, count)) {
        if (getline(infile, str)) {
          ++count;
          findReliedFiles(str, aFile);
          if (!findFuncs(str, aFile, count)) {
            twoLines = twoLines + "\n" + str;
            findFuncs(twoLines, aFile, count - 1);
          }
        } else
          break;
      }
    }
    infile.close();

    count = 0;
    infile.open(filePath);
    getline(infile, str);
    ++count;
    while (getline(infile, str)) {
      ++count;
      string twoLines;
      twoLines = str;
      findReliedFiles(str, aFile);
      if (!findFuncs(twoLines, aFile, count)) {
        if (getline(infile, str)) {
          ++count;
          findReliedFiles(str, aFile);
          if (!findFuncs(str, aFile, count)) {
            twoLines = twoLines + "\n" + str;
            findFuncs(twoLines, aFile, count - 1);
          }
        } else
          break;
      }
    }
    infile.close();

    aFile.displayReliedFiles();
    aFile.displayMyFunctions();

    string code;
    findFuncDefStr(filePath, aFile, code);

    splitPath(filePath, dir, ownname);
    cout << "There are " << count << " lines in " << filePath << endl << endl;

    for (vector<AFile>::iterator it = aFile.reliedFiles.begin();
         it != aFile.reliedFiles.end(); it++) {
      string path;
      path = dir + "/" + it->myName;
      // cout << "Next path: " << path << endl;
      findReliances(path);
    }
  }
}

int main(int argc, char *argv[]) {
  if (argc >= 2) {
    // vector<string> files;
    string dir;
    findReliances(argv[1]);
    // read_directory(dir,files);
    // for(int i=0;i<files.size();i++)
    // {
    //     cout  << " Path: " << files[i] <<endl;
    // }
  }
  // cout << "Argument number: " << argc << endl;
  // for (int i = 0; i < argc; i++) cout << "Arguments: " << argv[i] << endl;
  return 0;
}
