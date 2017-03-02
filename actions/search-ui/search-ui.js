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

/* Return main search page */
function main(args) {
//  let host = process.env['__OW_API_HOST'];
//  let ns = process.env['__OW_NAMESPACE'];
  //let searchAction = (args.domain || `${host}/api/v1/experimental/web/${ns}`) + '/owr/search.html';

  var html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>OpenWhisk Hub</title>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
      <link href="https://fonts.googleapis.com/css?family=Roboto:300,500" rel="stylesheet">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
      <style>
        .footer {
           position: absolute;
           bottom: 20px;
           height: 45px;
           background-color: #f5f5f5;
        }
        .entry {
          display: inline-block;
          vertical-align: top;
          float: none;
          height: 180px;
          width: 300px;
        }
        .etitle {
          font-size:18px;
          font-weight:500;
          padding-bottom:15px
        }
        .edesc {
          padding-bottom:20px;
          height:70px;
        }
        .hvr-glow {
          display: inline-block;
          -webkit-transform: perspective(1px) translateZ(0);
          transform: perspective(1px) translateZ(0);
          box-shadow: 0 0 1px transparent;
          -webkit-transition-duration: 0.3s;
          transition-duration: 0.3s;
          -webkit-transition-property: box-shadow;
          transition-property: box-shadow;
        }
        .hvr-glow:hover, .hvr-glow:focus, .hvr-glow:active {
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
        }
      </style>
    </head>
    <body style="padding-top:20px;font-family:Roboto;font-weight:300">
      <div class="container">
        <h2 class="text-center" style="padding-bottom:20px;font-family:Roboto;font-weight:300;font-size:45px">OpenWhisk Hub</h2>
        <form id="searchform" onsubmit="search(); return false">
          <div class="form-group" style="width:500px;margin:auto">
            <input id="searchtext" class="form-control" style="float:left;width:90%"
                   type="text"
                   name="text"
                   maxlength="1024"
                   placeholder="enter keywords to search for OpenWhisk packages"
                   value=""/>
            <button id="searchsubmit" type="button" class="btn btn-primary glyphicon glyphicon-search" style="float:right;left:-10px"></button>
          </div>
        </form>
        <div style="clear:left;padding-top:40px" id="searchresult" class="list-group">

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

      </div>
      <script type="text/javascript">
        var last
        $("#searchsubmit").click(function() {
          search();
        })

        function searchKeywords(keywords) {
          var txt = keywords.trim();
          if (last != txt) {
             last = txt;

             $("#searchresult").load("search.html?keywords="+encodeURIComponent(last));
          }
        }

        function search() {
          searchKeywords($("#searchtext").val());
        }

        function getUrlVars() {
          var vars = [], hash;
          var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
          for(var i = 0; i < hashes.length; i++)
          {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
          }
          return vars;
        }

        function onLoadSearch() {
          var vars = getUrlVars();
          if (vars && vars.keywords) {
            var keywords = decodeURIComponent(vars.keywords);

            $("#searchtext").value = keywords;
            searchKeywords(keywords);
          }
        }

         window.onload = onLoadSearch;
      </script>
    </body>
  </html>`;

  return {html: html};
}

exports.main = main
