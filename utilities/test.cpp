#include <fstream>
#include <iostream>
#include <regex>
#include <string>
using namespace std;
bool findFuncs(string str)
{
  regex regNote("\\s*(\\/|\\*).*"),
      regFunc("([a-z]+)\\s+([a-z]+\\w*)\\s*\\(.*\\)(?=(\\s*\\{))");
  smatch sm;
  if (regex_search(str, sm, regFunc))
    if (!regex_match(str, regNote))
    {
      // cout << str << endl;
      cout << sm[0] << endl;

      return true;
    }
  return false;
}

int main()
{
  string path("../utilities/asciiImg.c");
  // string path("/media/psf/Home/GitHub/codeLinter/utilities/asciiImg.c");
  ifstream infile;
  string str;
  infile.open(path);
  if (infile)
    while (getline(infile, str))
    {
      findFuncs(str);
    }
  infile.close();
  return 0;
}
