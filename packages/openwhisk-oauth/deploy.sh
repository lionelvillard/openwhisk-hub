#!/bin/bash

export PROVIDERS=`cat conf/providers.json`
export LOGIN_ENDPOINT=https://openwhiskhub.mybluemix.net/owr/login-redirect.http
export REDIRECT_URI="{ \"redirect_uri\": \"${LOGIN_ENDPOINT}\" }"
wskdeploy --apihost $APIHOST --auth $APIKEY
