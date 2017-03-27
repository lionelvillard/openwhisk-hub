const gulp = require('gulp');
const bs = require('browser-sync').create();
const tasks = require('./tasks');
const config = require('./config.js');


gulp.task('default', ['browser-sync', 'actions', 'watch']);

gulp.task('browser-sync', () => {
  bs.init({
    server: {
      baseDir: '../../actions',
      index: 'search-ui/search-ui.html',
    },
    notify: false,
    open: false
  });
});

gulp.task('reload', ['actions'], done => {
    bs.reload();
    done();
});

gulp.task('watch', ['actions'], () => {
  gulp.watch(`${config.paths.handlebars}/**/*.hbs`, ['reload']);
});
