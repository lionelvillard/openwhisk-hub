const gulp = require('gulp');
const browserify = require('gulp-browserify');
const bs = require('browser-sync').create();
const config = require('../config.js');
const rename = require("gulp-rename");


gulp.task('scripts', () => {
  gulp.src(`${config.paths.nodejs}/main.js`)
      .pipe(browserify({insertGlobals : true}))
      .pipe(rename('nodejs.hbs'))
      .pipe(gulp.dest('../../build/js'))
      .pipe(bs.stream());
});
