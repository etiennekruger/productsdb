#!/bin/sh

if [ ! -d ".ve" ]; then
    echo "Creating virtualenv..."
    virtualenv --no-site-packages .ve
fi

source ./.ve/bin/activate
pip install -r ./requirements.txt
