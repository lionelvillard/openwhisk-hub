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
  Fetch github readme and render as HTML

  @param {string} args.owner      github owner
  @param {string} args.repo       github repository
*/

var openwhisk = require('openwhisk');

function main(args) {
  var ow = openwhisk();

  return ow.actions.invoke({
    actionName: '/villard@us.ibm.com_dev/github/getReadme',
    params: {
      owner     : args.owner,
      repo      : args.repo,
      userAgent : 'OpenWhisk'
    },
    blocking : true
  })
  .then( readme => {
    let markdown = Buffer.from(readme.response.result.body.content, 'base64').toString();
    return ow.actions.invoke({
      actionName: '/villard@us.ibm.com_dev/github/renderMarkdownRaw',
      params: {
        body      : markdown,
        userAgent : 'OpenWhisk'
      },
      blocking : true
    });
  })
  .then( html => ({ html: html.response.result.body }) )
  .catch( err => Promise.reject(err) );
}
