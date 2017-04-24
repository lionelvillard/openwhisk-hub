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

/*
  Retrieve OpenWhisk api keys for given access token

  @param {string} args.access_token   authorization token
  @param {string} args.refresh_token  refresh token
*/
function main(args) {
  if (!args.hasOwnProperty('access_token'))
    return { error: "Missing argument 'access_token'." };

  if (!args.hasOwnProperty('access_token'))
    return { error: "Missing argument 'refresh_token'." };

  return new Promise((resolve, reject) => {

    let postData = JSON.stringify({
      accessToken  : args.access_token,
      refreshToken : args.refresh_token
    });

    let postOptions = {
      host: 'openwhisk.ng.bluemix.net',
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
        let auths = JSON.parse(data);
        resolve(auths);
      });

    });

    req.on('error', e => {
      console.log(`problem with request: ${e.message}`);
      reject({error: e});
    });

    req.write(postData);
    req.end();

  });
}
