#!/bin/bash

# temporary bash script to install registry actions. To be replace by wskdeploy

cd actions/publish && wsk action update owr/publish publish.js -P ../../db.json -a web-export true && cd ../..
cd actions/search && wsk action update owr/search search.js -P ../../db.json -a web-export true && cd ../..
cd actions/search-ui && wsk action update owr/search-ui search-ui.js -a web-export true && cd ../..
cd actions/show &&  wsk action update owr/show show.js web-export true && cd ../..
cd actions/release && zip -r release.zip * && wsk action update owr/release  release.zip --kind nodejs:6 && cd ../..
cd actions/login-redirect && wsk action update owr/login-redirect login-redirect.js -a web-export true && cd ../..
cd actions/render-readme && wsk action update owr/render-readme render-readme.js -a web-export true && cd ../..
