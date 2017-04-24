const gulp = require('gulp');
const rename = require("gulp-rename");
const handlebars = require('gulp-compile-handlebars');
const merge = require('merge-stream');
const config = require('../config.js');
const fs = require('fs');
const bs = require('browser-sync').create();


const pages = (example) => () => {
  let stream = page(config.paths.publicactions, 'search-ui', example);
  stream = merge(stream, page(config.paths.publicactions, 'show', example));
  stream = merge(stream, page(config.paths.publicactions, 'processing', example));
  return stream.pipe(bs.stream());
}

// no browserify quite yet 'scripts'
gulp.task('actions', ['rawpages', 'pages'], actions);
gulp.task('pages', pages(true));
gulp.task('rawpages', pages(false));

function actions() {
  let stream = action(config.paths.publicactions, 'search-ui');
  stream = merge(stream, action(config.paths.publicactions, 'show'));
  stream = merge(stream, action(config.paths.publicactions, 'processing'));
  return stream.pipe(bs.stream());
}

function page(actionpath, name, example) {
  let suffix = '';
  if (example)
    suffix = '-demo';
  return gulp.src(`${config.paths.handlebars}/pages/${name}.html.hbs`)
      .pipe(handlebars({withStatic: example, dev:config.options.dev}, config.options.handlebars))
      .pipe(rename(`${name}${suffix}.html`))
      .pipe(gulp.dest(`${actionpath}/${name}`));
}

function action(actionpath, name) {
  return gulp.src(`${config.paths.handlebars}/nodejs/wrapper-action.js.hbs`)
      .pipe(handlebars({html: escape(fs.readFileSync(`${actionpath}/${name}/${name}.html`))}, config.options.handlebars))
      .pipe(rename(`${name}.js`))
      .pipe(gulp.dest(`${actionpath}/${name}`));
}

function escape(str) {
  return str.toString().replace(/\\/g, '\\\\');
}
