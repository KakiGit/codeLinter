#include <stdio.h>
#include <fstream>
#include <iostream>

using namespace std;

int main() {
  ifstream infile;
  char c;
  infile.open("./asciiImg.c");
  infile.get(c);
  infile.close();
  c = '{';
  bool a;
  a = c == '{';
  cout << a << endl;
  return 0;
}