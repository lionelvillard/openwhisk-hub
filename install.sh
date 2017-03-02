#!/bin/bash

# temporary bash script to install registry actions. To be replace by wskdeploy

cd actions/publish && zip -r publish.zip * && wsk action update owr/publish publish.zip --kind nodejs:6 -P ../../db.json && cd ../..
cd actions/search && wsk action update owr/search search.js -P ../../db.json -a web-export true && cd ../..
cd actions/search-ui && wsk action update owr/search-ui search-ui.js -a web-export true && cd ../..
cd actions/show &&  zip -r show.zip * && wsk action update owr/show show.zip --kind nodejs:6 -a web-export true && cd ../..
