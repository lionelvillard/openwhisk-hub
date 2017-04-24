#!/bin/bash

source "${1-config_dev.sh}"

export REDIRECT_URI="{ \"redirect_uri\": \"${LOGIN_ENDPOINT}\" }"

(cd private; wskdeploy --apihost $APIHOST --auth $APIKEY)
(cd public; wskdeploy --apihost $APIHOST --auth $APIKEY)

(cd packages/openwhisk-oauth; wskdeploy --apihost $APIHOST --auth $APIKEY)
(cd packages/openwhisk-wskdeploy; source ./deploy.sh)

wsk package update owr --shared yes --apihost $APIHOST --auth $APIKEY

wsk action update owr/search --sequence /whisk.system/utils/echo,owr-backend/search --apihost $APIHOST --auth $APIKEY --web yes
