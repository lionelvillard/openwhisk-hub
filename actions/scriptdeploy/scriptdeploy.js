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

const request = require('request');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');
const exec = require('child_process').exec;

/*
  Fetch github repo and run script

   @param {string} args.owner             github owner
   @param {string} args.repo              github repository name
   @param {string} [args.tag]             github tag/branch name. Default is master
   @param {string} args.script            script to run
   @param {string} [args.env]             script environment

 */
function main(args) {
  if (!args.hasOwnProperty('owner'))
   return { error: "Missing argument 'owner' identifying the github repository owner." };

  if (!args.hasOwnProperty('repo'))
    return { error: "Missing argument 'repo' identifying the github repository name." };

  if (!args.hasOwnProperty('script'))
    return { error: "Missing argument 'script'." };

  let tag = (args.hasOwnProperty('tag')) ? args.tag : 'master';

  return fetchArchive(`http://github.com/${args.owner}/${args.repo}/archive/${tag}.zip`)
    .then( unzip )
    .then( run(args.script, args.env || {}, `${args.repo}-${tag}`) );
}

const fetchArchive = (url) => {
  return new Promise((resolve, reject) => {
    let outStream = fs.createWriteStream('repo.zip');
    request
      .get(url)
      .on('error', (err) => {
        return reject({error: err});
      })
      .on('end', () => {
        return resolve('repo.zip');
      })
      .pipe(outStream);
  });
}

const unzip = (file) => {
  yauzl.open(file, {lazyEntries: true}, (err, zipfile) => {
    if (err) return Promise.reject(err);

    zipfile.readEntry();
    zipfile.on('entry', (entry) => {
      if (/\/$/.test(entry.fileName)) {
        // directory file names end with '/'
        fs.mkdir(entry.fileName, (err) => {
          if (err && err.code !== 'EEXIST') throw err;
          zipfile.readEntry();
        });
      } else {

        // file entry
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) throw err;
          // ensure parent directory exists
          fs.mkdir(path.dirname(entry.fileName), (err) => {
            if (err && err.code !== 'EEXIST')  throw err;
            readStream.pipe(fs.createWriteStream(entry.fileName));
            readStream.on('end', () => {
              zipfile.readEntry();
            });
          });
        });
      }
    });
    zipfile.on('end', () => {
      return;
    });
  });

}

const run = (cmd, env, cwd) => {
  exec(cmd, {cwd: cwd, env}, (error, stdout, stderr) => {
    if (error) {
      return Promise.reject(error);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
};

// main({
//   owner : 'lionelvillard',
//   repo: 'openwhisk-hub',
//   script: 'deploy.sh'
// });
