#!/bin/sh

virtualenv --no-site-packages .ve

source ./.ve/bin/activate
pip install -r ./requirements.txt
