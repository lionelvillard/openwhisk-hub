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

function main(args) {
  return {html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>OpenWhisk Hub</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,500">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/octicons/4.4.0/font/octicons.min.css">
    
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <style>
      
      .navbar {
        min-height:32px !important;
        opacity: 0.8;
      }
      
      .navbar-padding {
        padding-top: 32px;
      }
      
      .footer {
         height: 45px;
         background-color: #f5f5f5;
         padding-top: 10px;
         padding-left: 10px;
         opacity: 0.8;
      }
      
      .float-right {
        float: right
      }
      
      .img-openwhisk {
        padding-left: 10px;
        padding-top: 6px;
      }
      
      .display-inline {
        display: inline-block;
      }
      
      .font-light {
        font-family:Roboto;
        font-weight:300
      }

      .search-bar {
        padding:10px;
        background-color:#EEEEEE;
        opacity: 0.8;
      }
    </style>
  </head>
  <body class="font-light navbar-padding">
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container-fluid">
          <div class="row">
            <img class="img-openwhisk" src="http://openwhisk.org/images/apache-openwhisk.svg" alt="Apache OpenWhisk">
            <button id="bluemixLogin" class="btn btn-sm btn-link float-right" onclick="loginBluemix('https://openwhiskhub.mybluemix.net/owr/show')">Log in Bluemix</button>
            <button id="bluemixLogout" class="btn btn-sm btn-link float-right hidden" onclick="logoutBluemix()">Log out</button>
            <button class="btn btn-sm btn-link float-right" onclick="showPublish()">Publish a Package</button>
          </div>
      </div>
    </nav>

    <div class="container-fluid">

      <div class="row search-bar">
        <form id="searchform" onsubmit="search(); return false">
          <div class="form-group" style="width:500px;margin:auto">
            <input id="searchtext" class="form-control" style="float:left;width:89%"
                   type="text"
                   name="text"
                   maxlength="1024"
                   placeholder="enter keywords to search for OpenWhisk packages"
                   value=""/>
            <button id="searchsubmit" type="button" class="btn btn-primary glyphicon glyphicon-search float-right"></button>
          </div>
        </form>

      </div>
      <div class="row">
        <div class="col-xs-9" style="margin-top:10px">
            <h2><span id="repo"></span> <small> by <span id="owner"></span></small></h2>
            <div style="border-top:1px solid #DDDDDD" id="readme"></div>
          
        </div>
        <div class="col-xs-3" style="margin-top:100px;border-left:1px solid #DDDDDD;height:200px">
          <div style="margin-bottom:10px"><a id="viewgithub" class="btn btn-primary"><span class="fa fa-github" style="font-size:20px"></span> View on GitHub</a></div>
          <div style="margin-bottom:10px"><button id="deploybluemix" type="button" class="btn btn-primary" onclick="deploy()" disabled>Deploy on Bluemix</button></div>
       </div>
      </div>
    </div>

    <footer class="footer navbar-fixed-bottom">
        <p class="text-muted">
          Try <a href="https://ibm.biz/openwhisk">OpenWhisk on IBM
          Bluemix</a> today or visit <a href="http://openwhisk.org">Apache
          Openwhisk</a> to learn more.
        </p>
    </footer>
    <div id="publishModal" class="modal fade publish-modal" style="font-family:Roboto;font-weight:300">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Publish your package to OpenWhisk Hub</h4>
                    <p class="modal-subtitle">Or refresh an existing package with new <strong>keywords</strong> or <strong>description</strong></p>
    
                </div>
                <div class="modal-body">
                  <div class="container-fluid">
                    <div class="row">
                      <div class="display-inline">https://github.com/</div>
                      <form class="display-inline" style="width:75%" onsubmit="return publish()" ><input id="github" class="form-control" type="text" name="repo" maxlength="1024"
                         placeholder="openwhisk/openwhisk" value="" oninput="clearError()"/></form>
                    </div>
                    <div class="row" style="margin-top:10px;font-size:12px">
                      <p id="publisherror" class="text-danger hidden">Repository must be of the form <strong>owner/repository</strong></p></div>
    
                  </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button id="publishsubmit" type="button" class="btn btn-primary" onclick="publish()">Publish</button>
                </div>
            </div>
        </div>
    </div>
    
    <div id="publishAlert" class="alert alert-success fade publish-alert">
      Your package have been published!
    </div>

  <script type="text/javascript">
    
    let state = {};
    
    function initState() {
      // Read URL vars.
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        state[hash[0].trim()] = hash[1];
      }
    }
    
    let icookies = {};
    function indexCookies() {
      if (document.cookie) {
        let cookies = decodeURIComponent(document.cookie);
        let ca = cookies.split(';');
        for  (var i = 0; i < ca.length; i++) {
          let keyvalue = ca[i].trim().split('=');
          icookies[keyvalue[0].trim()] = keyvalue[1].trim();
        }
      }
    }
    function onLoadCommon() {
      indexCookies();
      initState();
    
      updateBluemixLoginState();
    }
    function showPublish() {
      $('#publishModal').modal('show');
    }
    
    function clearError() {
      $('#publisherror').addClass('hidden');
    }
    
    function publish() {
      var txt = $('#github').val().trim();
      var matched = txt.match(/^([^\\/ ]+)\\/([^\\/ ]+)$/);
      if (matched) {
    
        $.get('publish.html?owner=' + encodeURIComponent(matched[1]) + '&repo=' + encodeURIComponent(matched[2]));
    
        $('#publishModal').modal('hide');
        setTimeout(function() {
          $('#publishAlert').addClass('in');
        }, 250);
        setTimeout(function() {
          $('#publishAlert').removeClass('in');
        }, 2000);
      } else {
        $('#publisherror').removeClass('hidden');
      }
      return false;
    }
    
    function updateBluemixLoginState() {
      if (icookies.hasOwnProperty('bluemix')) {
        $('#bluemixLogin').addClass('hidden');
        $('#bluemixLogout').removeClass('hidden');
      } else {
        $('#bluemixLogin').removeClass('hidden');
        $('#bluemixLogout').addClass('hidden');
      }
    }
    
    function loginBluemix(endpoint) {
      state.providerName = 'bluemix';
      state.redirect_uri = endpoint;
    
      let url = 'http://login.ng.bluemix.net/UAALoginServerWAR/oauth/authorize';
      let redirect_uri = encodeURIComponent('https://openwhiskhub.mybluemix.net/owr/login-redirect.http');
      let encstate = encodeURIComponent(JSON.stringify(state));
    
      window.location.href = url + '?client_id=openwhiskhub&response_type=code&redirect_uri=' + redirect_uri + '&state=' + encstate;
    }
    
    function logoutBluemix() {
      delete state.access_token;
      delete state.refresh_token;
      delete state.owauth;
      updateBluemixLoginState();
    }

    $("#searchsubmit").click(function() {
      var txt = $("#searchtext").val().trim();
      $("#searchresult").load("search.html?keywords"+last);
    })

    function checkManifest() {
      $.get('https://raw.githubusercontent.com/lionelvillard/openwhisk-hub/master/manifest.yaml', function(data) {
        $("#deploybluemix").prop('disabled', false);
      });
    }

    function refresh() {
      if (state.hasOwnProperty('repo') && state.hasOwnProperty('owner')) {
        $("#repo").text(state.repo);
        $("#owner").text(state.owner);
        $("#viewgithub").attr('href', 'https://github.com/' + state.owner + '/' + state.repo);


        $("#readme").load('/owr/render-readme.html?repo=' + state.repo + '&owner=' + state.owner);
      };
    }


    window.onload = function() {
      onLoadCommon();

      refresh();
    }

  </script>
  </body>
</html>
`};
}
