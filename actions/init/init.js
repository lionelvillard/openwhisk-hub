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

/* Initialize OpenWhisk Cloudant Registry

   Input:
     host       where the cloudant service is located
     username
     password

   or
     url
 */
var openwhisk = require('openwhisk');

function main(args) {
  var ow = openwhisk();

  var p = createPackage(ow);
  p = p.then( () => createOWRDatabase(ow, args) );
  p = p.then( () => createKeywordIndex(ow, args) );
  p = p.then( () => { "initialized": true } );
  return p;
}

function createPackage(ow) {
  const packageName = 'owr';
  return ow.packages.update({packageName, package: { publish:true }});
}

function createOWRDatabase(ow, args) {
  let params = args;
  return ow.actions.invoke({actionName:'/whisk.system/cloudant/create-database', params, blocking:true}).catch(()=>{});
}

function createKeywordIndex(ow, args) {
  let params = args;
  params.doc = {
    '_id': '_design/keywords',
    indexes: {
      searchKeywords: {
        analyzer: { name: "standard" },
        index : ''+ keyword_indexer
      }
    }
  };
  return ow.actions.invoke({actionName:'/whisk.system/cloudant/create-document', params, blocking:true}).catch(()=>{});
}

function keyword_indexer(doc) {
  index('default', doc._id, {'store':true});
  if (doc.description) {
    index('default', doc.description, {'store': true});
  }
}

exports.main = main;
