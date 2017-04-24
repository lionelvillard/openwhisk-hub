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

var openwhisk = require('openwhisk');
var yaml = require('yamljs');

/*
   Fetch manifest in github repo and parse it.

   @param {string} args.owner     github owner
   @param {string} args.repo      github repository name
   @param {string} [args.version] package version. If not specify, use latest (master branch)
*/

function main(args) {
  if (!args.hasOwnProperty('owner'))
   return { error: "Missing argument 'owner' identifying the github repository owner." };

  if (!args.hasOwnProperty('repo'))
    return { error: "Missing argument 'repo' identifying the github repository name." };

  // TODO: version

  // let options = {
  //   apihost: 'openwhisk.ng.bluemix.net',
  //   api_key: '...'
//  }
  let ow = extendOpenWhisk(openwhisk());

  return getContent(ow, args.owner, args.repo)
         .then(parseManifest(args))
         .catch( err => Promise.reject({error: err}) );
}


// Fetch manifest content
var getContent = (ow, owner, repo) => {
  return ow.actions.unsafeCall(
    {
      actionName: '/villard@us.ibm.com_dev/github/getContent',
      params: {
        owner     : owner,
        repo      : repo,
        path      : 'manifest.yaml',
        userAgent : 'OpenWhisk'
      }
    }).catch( err => ow.actions.call(
      {
        actionName: '/villard@us.ibm.com_dev/github/getContent',
        params: {
          owner     : owner,
          repo      : repo,
          path      : 'manifest.yml',
          userAgent : 'OpenWhisk'
        }
      }));
}

var parseManifest = args => response => {
  console.log('Parse manifest');

  if (response.hasOwnProperty('error'))
    return Promise.reject(`Error: GitHub repository ${args.owner}/${args.repo} does not exist.`);

  let manifest = Buffer.from(response.body.content, 'base64').toString();
  console.log(manifest);

  try {
    let parsed = yaml.parse(manifest);
    return { manifest: parsed }
  } catch (e) {
    return Promise.reject(e);
  }
}


function extendOpenWhisk(ow) {

  ow.actions.call = params => {
    params.blocking = true;
    return ow.actions.invoke(params)
                     .then( result => result.response.result )
                     .catch( err => err );
  };

  ow.actions.unsafeCall = params => {
    params.blocking = true;
    return ow.actions.invoke(params)
                     .then( result => result.response.result );
  };

  return ow;
}

exports.main = main;
