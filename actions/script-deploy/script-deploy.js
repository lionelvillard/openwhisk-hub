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
const execFile = require('child_process').execFile;

/*
  Fetch github repo and run script

  @param {string} args.owner             github owner
  @param {string} args.repo              github repository name
  @param {string} [args.tag]             github tag/branch name. Default is 'master'
  @param {string} [args.script]          script to run. Default is 'deploy.sh'
  @param {string} [args.env]             script environment
 */
function main(args) {
  if (!args.hasOwnProperty('owner'))
   return { error: "Missing argument 'owner' identifying the github repository owner." };

  if (!args.hasOwnProperty('repo'))
    return { error: "Missing argument 'repo' identifying the github repository name." };

  let tag = (args.hasOwnProperty('tag')) ? args.tag : 'master';

  return fetchArchive(`http://github.com/${args.owner}/${args.repo}/archive/${tag}.zip`)
    .then( unzip )
    .then( run(args.script || 'deploy.sh', args.env || {}, `${args.repo}-${tag}`) )
    .then( done )
    .catch( err => ({ error: err }) );
}


const fetchArchive = (url) => {
  console.log('fetchArchive');
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
};

const unzip = (file) => {
  console.log(`unzip ${file}`);
  return new Promise((resolve, reject) => {
    yauzl.open(file, {lazyEntries: true}, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // directory file names end with '/'
          console.log(`mkdir ${entry.fileName}`);
          fs.mkdir(entry.fileName, (err) => {
            if (err && err.code !== 'EEXIST') throw err;
            zipfile.readEntry();
          });
        } else {

          console.log(`unzip ${entry.fileName}`);
          // file entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) throw err;
            // ensure parent directory exists
            fs.mkdir(path.dirname(entry.fileName), (err) => {
              if (err && err.code !== 'EEXIST')  throw err;

              let options = {};
              if (entry.fileName.endsWith('.sh')) {
                options.mode = 0o766;
              }

              readStream.pipe(fs.createWriteStream(entry.fileName, options));
              readStream.on('end', () => {
                zipfile.readEntry();
              });
            });
          });
        }
      });
      zipfile.on('end', () => {
        resolve();
      });
    });
  });
};

const run = (cmd, env, cwd) => () => {
  console.log('run');
  console.log(cwd);
  return new Promise((resolve, reject) => {
    execFile(cmd, {cwd, env}, (error, stdout, stderr) => {
      console.log('executed');
      if (error) {
        return reject(error);
      }

      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      resolve();
    });
  });
};

const done = () => {
  console.log('done');

  return { success: true };
}
