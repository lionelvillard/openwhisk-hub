#!/bin/bash

if [ ! -f wskdeploy-0.4.0-linux-amd64.zip ]; then
 wget https://github.com/openwhisk/openwhisk-wskdeploy/releases/download/0.4.0/wskdeploy-0.4.0-linux-amd64.zip
fi

unzip -u wskdeploy-0.4.0-linux-amd64.zip
mv wskdeploy exec
zip action.zip exec
wsk action update owr/wskdeploy action.zip --docker -u $APIKEY --apihost $APIHOST
