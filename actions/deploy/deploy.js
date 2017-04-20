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


let openwhisk = require('openwhisk');

/* Invoke wskdeploy through a webaction

   @param {string} args.owner             github owner
   @param {string} args.repo              github repository name
   @param {string} args.auth              OpenWhisk API key
   @param {string} args.apihost           OpenWhisk API host

 */
function main(args) {
  if (!args.hasOwnProperty('owner'))
   return { error: "Missing argument 'owner' identifying the github repository owner." };

  if (!args.hasOwnProperty('repo'))
    return { error: "Missing argument 'repo' identifying the github repository name." };

  if (!args.hasOwnProperty('auth'))
    return { error: "Missing argument 'auth'." };

  if (!args.hasOwnProperty('apihost'))
    return { error: "Missing argument 'apihost'." };

  //
  // let options = {
  //   apihost: 'openwhisk.ng.bluemix.net',
  //   api_key: '...'
  // }
  let ow = openwhisk();
  let cmd = `-m https://raw.githubusercontent.com/${args.owner}/${arg.repo}/master/manifest.yaml --apihost ${args.apihost} --auth ${args.auth}`;
  return ow.action.invoke({
    actionName:'wskdeploy', params: { cmd }, blocking:true
  });
}

main();
