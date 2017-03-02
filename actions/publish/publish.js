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


/*
   Publish an OpenWhisk Package to the given registry

   Input:
     host       where the cloudant service is located
     username
     password
     dbname
    or
     url


     owner      github owner
     repo       github repository
*/

var openwhisk = require('openwhisk');
var GitHubApi = require('github');

function main(args) {
  var ow = openwhisk();

  var github = new GitHubApi({
    //debug: true
  });

  var p = github.repos.get({owner: args.owner, repo: args.repo});
  p = p.then( repo => {
    var data = repo.data;

    var rev = getRevision(ow, args, data)
    rev = rev.then( result => updateEntry(ow, args, result.response.result, data) );
    rev = rev.then( result => Promise.resolve({ updated: true }));
    return rev.catch( err => register(ow, args, data) );
  });
  return p;
}

function getRevision(ow, args, repo) {
  //console.log(`get revision ${repo.full_name}`);
  let params = args;
  params.docid = repo.full_name;
  return ow.actions.invoke({actionName:'/whisk.system/cloudant/read-document', params, blocking:true});
}

function updateEntry(ow, args, olddoc, repo) {
  //console.log(`update entry ${repo.full_name}`);
  let params = args;
  params.doc = makeEntry(repo);
  params.doc._rev = olddoc._rev;

  return ow.actions.invoke({actionName:'/whisk.system/cloudant/update-document', params, blocking:true}).catch( err => { error: err });
}

function register(ow, args, repo) {
  //console.log(`register ${repo.full_name}`);
  let params = args;
  params.doc = makeEntry(repo);

  return ow.actions.invoke({actionName:'/whisk.system/cloudant/create-document', params, blocking:true}).catch( err => { error: err });
}

function makeEntry(repo) {
  return {
    _id: repo.full_name,
    description: repo.description,
    repository: repo.html_url
  };
}

exports.main = main;
