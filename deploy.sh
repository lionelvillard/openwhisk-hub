#!/bin/bash

source "${1-config_dev-test.sh}"

export REDIRECT_URI="{ \"redirect_uri\": \"${LOGIN_ENDPOINT}\" }"

(cd private; wskdeploy --apihost $APIHOST --auth $APIKEY)
(cd public; wskdeploy --apihost $APIHOST --auth $APIKEY)

(cd packages/openwhisk-oauth; wskdeploy --apihost $APIHOST --auth $APIKEY)
(cd packages/openwhisk-wskdeploy; source ./deploy.sh)

wsk update package owr --shared yes --apihost $APIHOST --auth $APIKEY
