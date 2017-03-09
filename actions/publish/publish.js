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

/*
   Publish or update an OpenWhisk Package to the OpenWhisk registry.

   @param {string} args.dburl    where the cloudant service hosting the registry is located
   @param {string} [args.dbname] the Cloudant db name
   @param {string} args.owner    github owner
   @param {string} args.repo     github repository name
*/

function main(args) {
  if (!args.hasOwnProperty('dburl'))
    return { error: "Missing argument 'dburl'" };

  if (!args.hasOwnProperty('owner'))
   return { error: "Missing argument 'owner' identifying the github repository owner." };

  if (!args.hasOwnProperty('repo'))
    return { error: "Missing argument 'repo' identifying the github repository name." };

  args.url = args.dburl;
  //
  // let options = {
  //   apihost: 'openwhisk.ng.bluemix.net',
  //   api_key: '...'
  // }
  let ow = extendOpenWhisk(openwhisk());

  return getRepo(ow, args.owner, args.repo)
        .then(registerOrUpdate(ow, args));
}

// Fetch repository info.
var getRepo = (ow, owner, repo) => {
  return ow.actions.call(
    {
      actionName: '/villard@us.ibm.com_dev/github/getRepo',
      params: {
        owner     : owner,
        repo      : repo,
        userAgent : 'OpenWhisk'
      }
    });
}

var registerOrUpdate = (ow, args) => response => {
  console.log('registerOrUpdate');


  if (response.hasOwnProperty('error'))
    throw `Error: GitHub repository ${args.owner}/${args.repo} does not exist.`;

  let repo = response.body;

  let dbentry = {
    _id: repo.full_name,
    description: repo.description,
    repository: repo.html_url
  };

  return getRevision(ow, args, repo)
          .then(updateEntry(ow, args, repo, dbentry))
          .then( () => ({ html: 'success' }))
        .catch(noRevision(ow, args, repo, dbentry));
}

var getRevision = (ow, params, repo) => {
  console.log('getRevision');

  params.docid = repo.full_name;
  return ow.actions.unsafeCall({actionName:'/whisk.system/cloudant/read-document', params});
}

var updateEntry = (ow, params, repo, entry) => olddoc => {
  params.doc = entry;
  params.doc._rev = olddoc._rev;
  console.log('updateEntry');
  return ow.actions.call({actionName:'/whisk.system/cloudant/update-document', params});
}

// Got an error: check it's because there is no existing document in db.
var noRevision = (ow, params, repo, entry) => err => {
  let statusCode = err.error.response.result.error.statusCode;
  console.log(statusCode);
  if (statusCode != 404) { // Not there? normal.
     throw err.error.response.result.error;
  } else {
     return register(ow, params, repo, entry);
  }
}

var register = (ow, params, repo, entry) => {
  params.doc = entry;

  return ow.actions.call({actionName:'/whisk.system/cloudant/create-document', params});
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
