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
   Search for packages from list of keywords
   Input:
     dburl       where the cloudant service is located
     dbname     the name of the database containing the registry
     keywords   space-separated list of keywords
*/
var openwhisk = require('openwhisk');
var url = require('url');

function main(args) {
  console.log(JSON.stringify(args));

  let ow = openwhisk();

  let params = {
    url : args.dburl,
    dbname: args.dbname,
    docid : 'keywords',
    indexname : 'searchKeywords',
    search : {q: makeQuery(args.keywords), include_docs: true}
  };
  return ow.actions.invoke({actionName:'/whisk.system/cloudant/exec-query-search', params, blocking:true}).then( result => {
    let rows = result.response.result.rows;

    let html = "";
    for (var i = 0; i < rows.length; i++) {
      let name = rows[i].doc._id.trim();
      if (name.length > 30) {
        name = name.substring(0, 30);
        name += '...';
      }
      let desc = rows[i].doc.description || "";
      desc = desc.trim();
      if (desc.length > 100) {
        desc = desc.substring(0, 100);
        desc += '...';
      }

      let fullrepo = rows[i].doc.repo;
      let owner = 'openwhisk', repo = 'openwhisk';
      if (fullrepo) {
        let path = url.parse(fullrepo).path.split('/');
        owner = path[path.length - 2];
        repo = path[path.length - 1];
      }

      // TODO: should return a JSON object.
      // TODO: package name should not be hardcoded 

      html += `
          <div class="list-group-item well container hvr-glow entry">
            <div class="row" onclick="location.href='../owr/show.html?owner=${owner}&repo=${repo}'">
              <div class="text-center" style="font-size:18px;font-weight:500;padding-bottom:15px">${name}</div>
              <div class="text-center edesc">${desc}</div>`;
      if (fullrepo) {
        html += `<div><a href="${fullrepo}" class="btn btn-outline"><span class="fa fa-github" style="font-size:20px;"></span> View on GitHub</a></div>`;
      }
      html += '</div></div>';
    }
    return Promise.resolve({html:html});
  });
}

function makeQuery(keywords) {
  let query = '';
  let kws = keywords.trim().split(/[ ]+/);
  for (let i = 0; i < kws.length; i++) {
    if (i > 0)
      query += ' OR ';
    if (kws[i] === 'OR' || kws[i] === 'AND' || kws[i] === 'NOT')
      query += '\\\\';
    else if (kws[i] === '*')
      query += '*:';

    query += kws[i];
  }
  return query;
}

exports.main = main;
