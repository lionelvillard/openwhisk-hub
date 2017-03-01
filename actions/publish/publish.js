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
   Publish OpenWhisk Package to the given registry

   Input:
     host       where the cloudant service is located
     username
     password
     dbname
    or
     url

     manifest   the manifest file (as string value)
*/

var openwhisk = require('openwhisk');

function main(args) {
  var yaml = require('js-yaml');
  // Read manifest and assemble cloudant document.
  var manifest;
  try {
    manifest = yaml.safeLoad(args.manifest);
  } catch (e) {
    return Promise.reject({"error":e});
  }

  var ow = openwhisk();
  var doc = {
    _id: manifest.package.name,
    description: manifest.package.description,
    version: manifest.package.version,
    repositories: manifest.package.repositories
  };

  var p = getRevision(ow, args, doc);
  p = p.then( result => updateDocument(ow, args, result.response.result, doc) );
  p = p.then( result => Promise.resolve({ updated: true }));
  p = p.catch( err => createDocument(ow, args, doc) );
  return p;
}

function getRevision(ow, args, doc) {
  console.log(`get revision ${doc._id}`);
  let params = args;
  params.docid = doc._id;
  return ow.actions.invoke({actionName:'/whisk.system/cloudant/read-document', params, blocking:true});
}

function updateDocument(ow, args, olddoc, doc) {
  doc._rev = olddoc._rev;
  let params = args;
  params.doc = doc;

  return ow.actions.invoke({actionName:'/whisk.system/cloudant/update-document', params, blocking:true});
}

function createDocument(ow, args, doc) {
  console.log(`createDocument ${doc._id}`);
  let params = args;
  params.doc = doc;

  return ow.actions.invoke({actionName:'/whisk.system/cloudant/create-document', params, blocking:true});
}

exports.main = main;
