/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const openwhisk = require('openwhisk');
const https = require('https');
const querystring = require('querystring');

/*
  Redirect from oauth.

  @param
    */
function main(params) {
  let ow = openwhisk();
  // Got the code. Now needs to get the access token
  return ow.actions.invoke({actionName:'/villard@us.ibm.com_dev/oauth/login', params, blocking:true})
         .then( result => {
           return redirect(result.response.result);
         })
         .catch( err => err );
}

function redirect(params) {
  const payload = {
    statusCode: 302,
    headers: {
      location: params.state.redirect_uri
    }
  };

  const cookie = {
    provider: params.provider,
    access_token: params.access_token,
    refresh_token: params.access_token_body.refresh_token,
    id: params.id,
    idRecord: params.idRecord
  }
  payload.headers["Set-Cookie"] = `bluemix=${JSON.stringify(cookie)}; Path=/;`

  return payload;
}
