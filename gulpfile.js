//////////////////////
var gulp = require('gulp');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cssify = require('cssify');

/* nicer browserify errors */
var gutil = require('gulp-util');
var chalk = require('chalk');


var constant = {
  scriptName: 'scrollEffects.js',
  entrypoint: './src/scroll-effects.js',
  distFolder: './dist/',
  dist: './dist/scrollEffects.js'
};

function mapError(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/src/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description));
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message));
  }

  this.end();
}
/* */

gulp.task('watch', function () {
  var bundler = watchify(getBundler());
  bundleJs(getBundler());
  bundler.on('update', function () {
    bundleJs(bundler);
  });
});

function bundleJs(bundler) {
  return bundler.bundle()
    .on('error', mapError)
    .pipe(source(constant.scriptName))
    .pipe(buffer())
    .pipe(gulp.dest(constant.distFolder))
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.init({ loadMaps: true }))
      // capture sourcemaps from transforms
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(constant.distFolder));
}

function getBundler() {
  return browserify(constant.entrypoint)
    .transform(cssify, {})
    .transform(babelify, {
      presets: ['es2015', 'react', 'stage-0']
    });
}

// Without watchify
gulp.task('browserify', function () {
  return bundleJs(getBundler());
});

// Without sourcemaps
gulp.task('browserify-production', function () {
  return getBundler().bundle()
    .on('error', mapError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/dist'));
});
