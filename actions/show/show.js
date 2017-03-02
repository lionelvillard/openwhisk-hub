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

/* Return detailed OpenWhisk information
   Input:
    owner      github owner
    repo       github repository
*/

var openwhisk = require('openwhisk');
var GitHubApi = require('github');

function main(args) {
  var ow = openwhisk();

  var github = new GitHubApi({
  //  debug: true
  });

  return github.repos.getReadme({owner: args.owner, repo: args.repo}).then( readme => {
    //console.log(JSON.stringify(readme));
    var markdown = Buffer.from(readme.data.content, 'base64');

    return github.misc.renderMarkdownRaw({data: markdown}).then( htmlreadme => {
      //console.log(JSON.stringify(htmlreadme.data));
      var html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>OpenWhisk openwhisk-hub</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
          <link href="https://fonts.googleapis.com/css?family=Roboto:300,500" rel="stylesheet">
          <link href="https://cdnjs.cloudflare.com/ajax/libs/octicons/4.4.0/font/octicons.min.css" rel="stylesheet">
          <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
          <style>
            .footer {
               position: absolute;
               bottom: 0px;
               height: 45px;
               background-color: #f5f5f5;
               margin:30px;
            }
          </style>
        </head>
        <body style="font-family:Roboto;font-weight:300">
          <div class=".container-fluid" style="padding:10px;background-color:#EEEEEE">
            <div class="row">
              <form id="searchform" onsubmit="return search()">
                <div class="form-group" style="width:500px;margin:auto">
                  <input id="searchtext" class="form-control" style="float:left;width:89%"
                         type="text" name="text" maxlength="1024" placeholder="enter keywords to search for OpenWhisk packages" value=""/>
                  <button id="searchsubmit" onsubmit="return search()" type="button" class="btn btn-primary glyphicon glyphicon-search" style="float:right"></button>
                </div>
              </form>
            </div>
          </div>
          <div class=".container-fluid" style="margin:30px">
              <div class="row">
                <div class="col-xs-8" style="margin-top:10px">
                  <h2>${args.repo} <small> by ${args.owner}</small></h2>
                  <div style="border-top:1px solid #DDDDDD">${htmlreadme.data}</div>
                </div>
                <div class="col-xs-4" style="margin-top:100px;border-left:1px solid #DDDDDD;height:200px">
                  <div><a href="https://github.com/${args.owner}/${args.repo}" class="btn btn-primary"><span class="fa fa-github" style="font-size:20px;"></span> View on GitHub</a></div>
                </div>
            </div>

        </div>
          <footer class="footer">
          <div class="container" style="width:100%">
            <p class="text-muted" style="text-align:center;margin-top:12px">
              Try <a href="https://ibm.biz/openwhisk">OpenWhisk on IBM
              Bluemix</a> today or visit <a href="http://openwhisk.org">Apache
              Openwhisk</a> to learn more.
            </p>
          </div>
        </footer>
        <script type="text/javascript">
          function search() {
            window.location.replace("search-ui.html?keywords="+encodeURIComponent($("#searchtext").val().trim()));
            return false;
          }

        </script>
        </body>
      </html>`;
      //console.log(html);
      return Promise.resolve({html: html});
    });
  });
}

exports.main = main
