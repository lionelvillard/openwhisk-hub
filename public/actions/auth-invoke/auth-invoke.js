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

 const openwhisk = require('openwhisk');

/*
  Execute action using auth key

  @param {string} args.name         action name.
  @param {string} [args.params]     action parameters. Default is '{}'.
  @param {string} [args.space]      Bluemix space corresponding to authorization key. Default is first on in the list.
  @param {string} [args.apihost]    whisk API host. Default is 'openwhisk.ng.bluemix.net'
*/
function main(args) {
  if (!args.hasOwnProperty('name'))
    return { error: "Missing argument 'name' (action name)"} ;

  let headers = args.__ow_headers;
  if (!headers.hasOwnProperty('cookie'))
    return { error: "Missing HTTP cookie"};

  let cookies = indexCookies(headers.cookie);
  if (!cookies.hasOwnProperty('bluemix'))
    return { error: "Missing bluemix credentials" };

  let bluemix = cookies.bluemix;
  if (!bluemix.hasOwnProperty('auths') || bluemix.auths.namespaces.length == 0)
    return { error: "Missing OpenWhisk authorization keys" };

  let namespaces = bluemix.auths.namespaces;
  let auth = namespaces[0].key;
  if (args.space) {
    for (const ns of namespaces) {
      if (ns.name.endsWith(args.space)) {
        auth = `${ns.uuid}:${ns.key}`;
        break;
      }
    }
  } else {
    auth = `${namespaces[0].uuid}:${namespaces[0].key}`;
  }

  let ow = openwhisk({
    apihost: args.apihost || 'openwhisk.ng.bluemix.net',
    api_key: auth
  });

  let params = args.params;
  if (params) {
    params = JSON.parse(params);
  } else {
    params = {};
  }
  return ow.actions.invoke({
    actionName: args.name,
    params
  });
}

const indexCookies = (cookies) => {
  let icookies = {};
  let ca = cookies.split(';');
  for  (let i = 0; i < ca.length; i++) {
    let entry = ca[i].trim();
    let eqi = entry.indexOf('=');
    let key = entry.substring(0, eqi);
    let value = entry.substring(eqi + 1);
    if (key === 'bluemix')
      value = JSON.parse(value);
    icookies[key] = value;
  }
  return icookies;
}
