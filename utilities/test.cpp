#include <stdio.h>
#include <fstream>
#include <iostream>
#include <regex>
#include <vector>

using namespace std;

int main() {
  vector<int> v = {3, 2, 1, 4, 6, 5, 8, 7, 9};
  for (int i = 0; i < v.size(); i++) {
    cout << v.at(i) << endl;
  }
  cout << "???" << endl;
  for (vector<int>::iterator it = v.begin(); it != v.end(); it++)
    cout << *it << endl;
  return 0;
}