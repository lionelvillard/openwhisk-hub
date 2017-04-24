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

const _ = require('lodash');

/*
  Login to bluemix and deploy by running arbitrary script

  @param {string} args.owner             github owner
  @param {string} args.repo              github repository name
  @param {string} [args.space]           Bluemix space to use for deployment. Default is the first one of all received spaces
  @param {string} [args.tag]             github tag/branch name. Default is 'master'
  @param {string} [args.script]          script to run. Default is 'deploy.sh'
  @param {string} [args.env]             script environment
 */
function main(args) {
  let params = _.pick(args, ['owner', 'repo', 'tag', 'script', 'env']);

  let query = 'name=' + encodeURIComponent('/villard@us.ibm.com_dev/owr/script-deploy') + '&params=' + encodeURIComponent(JSON.stringify(params));

  if (args.space)
    query += '&space=' + encodeURIComponent(args.space);

  let job = encodeURIComponent(`https://openwhiskhub.mybluemix.net/owr/auth-invoke?${query}`);

  let state = encodeURIComponent(JSON.stringify({
    providerName: 'bluemix',
    redirect_uri: `https://openwhiskhub.mybluemix.net/owr/processing.html?job=${job}`
  }));

  return {
    statusCode: 302,
    headers: {
      location: 'https://login.ng.bluemix.net/UAALoginServerWAR/oauth/authorize?client_id=openwhiskhub&response_type=code&redirect_uri=https://openwhiskhub.mybluemix.net/owr/login-redirect.http&state=' + state
    }
  };
}
