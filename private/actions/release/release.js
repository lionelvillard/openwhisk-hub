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
   Create a release

   Input:
     access_token   github access token
     owner          github owner
     repo           github repository
     tag            the name of the tag
     message        the name of the release.
     sha            the SHA determining where the Git tag is created from
*/
var GitHubApi = require('github');

function main(args) {
  var github = new GitHubApi();

  github.authenticate({
    type: 'oauth',
    token: args.access_token
  });

  const createRelease = () => {
    return github.repos.createRelease({
        owner: args.owner,
        repo: args.repo,
        tag_name: args.tag,
        message:args.message,
        target_commitish:args.object,
    });
  };

  const e = (err) => {
    return Promise.reject({error: err});
  };

  return createRelease().catch(e);
}

exports.main = main;
