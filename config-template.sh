#!/bin/bash

# Cloudant DB credentials
export DBURL=

# OpenWhisk host
APIHOST=openwhisk.ng.bluemix.net

# OpenWhisk API key
APIKEY=

# OAuth providers (relative paths from packages/openwhisk-oauth)
export PROVIDERS=`cat conf/providers.json`
export LOGIN_ENDPOINT=
