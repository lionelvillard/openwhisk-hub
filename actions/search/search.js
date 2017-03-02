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
     host       where the cloudant service is located
     username
     password
     dbname     the name of the database containing the registry
     keywords   space-separated list of keywords
*/
var openwhisk = require('openwhisk');
var url = require('url');

function main(args) {
  let ow = openwhisk();

  let params = args;
  params.docid = 'keywords';
  params.indexname = 'searchKeywords';
  params.search = {q: args.keywords, include_docs: true};

  return ow.actions.invoke({actionName:'/whisk.system/cloudant/exec-query-search', params, blocking:true}).then( result => {
    let rows = result.response.result.rows;
    console.log(rows);

    let html = "";
    for (var i in rows) {
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
      fullrepo = 'https://github.com/openwhisk/openwhisk2';
      let owner = 'openwhisk', repo = 'openwhisk';
      if (fullrepo) {
        let path = url.parse(fullrepo).path.split('/');
        console.log(path);
        owner = path[path.length - 2];
        repo = path[path.length - 1];
        console.log(owner);
        console.log(repo);
      }

      html += `
          <div class="list-group-item well container entry hvr-glow">
            <div class="row" onclick="location.href='../show/show.html?owner=${owner}&repo=${repo}'">
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

exports.main = main;
