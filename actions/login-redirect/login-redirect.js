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

/* Redirect from oauth. */
function main(params) {
  let ow = openwhisk();
  // Got the code. Now needs to get the access token
  return ow.actions.invoke({actionName:'/villard@us.ibm.com_dev/oauth/login', params, blocking:true})
         .then( result => {
           return new Promise((resolve, reject) => {
             let params = result.response.result;


             let postData = JSON.stringify({
               accessToken  : params.access_token,
               refreshToken : params.access_token_body.refresh_token
             });

             let postOptions = {
               host: 'https://openwhisk.ng.bluemix.net',
               path: '/bluemix/v1/authenticate',
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 'Content-Length': Buffer.byteLength(postData)
               }
             };

             let req = https.request(postOptions, res => {
               res.setEncoding('utf8');
               let data = '';
               res.on('data', chunk => {
                 data += chunk;
               });
               res.on('end', () => {
                 let owkeys = JSON.parse(data);

                 params.auths = owkeys;

                 resolve(redirect(params));
               });

             });

             req.on('error', e => {
               console.log(`problem with request: ${e.message}`);
               resolve(redirect(params));
             });

             console.log(JSON.stringify(postData));

             req.write(postData);
             req.end();

           }).catch( err => err);
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
    id: params.id,
    idRecord: params.idRecord,
    auths: params.auths
  }
  payload.headers["Set-Cookie"] = `bluemix=${JSON.stringify(cookie)}; Path=/;`

  return payload;
}
