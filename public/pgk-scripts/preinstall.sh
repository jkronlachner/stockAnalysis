#!/bin/bash
if [[ "$java -version " == *"not recognized"* ]]; then
  echo "Java is not installed!"
  exit 1
  fi;
if [[ "$python --version " == *"not recognized"* ]]; then
  echo "Pyhton is not installed"
  exit 1;
fi;
pip install keras tensorflow numpy matplotlib
echo "Everything installed"
exit 0;
