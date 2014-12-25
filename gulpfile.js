var gulp = require('gulp');
var del = require('del');
var gulpFilter = require('gulp-filter');
var gulpWebpack = require('gulp-webpack');

var staticPath = './static';
var outputPath = './dist';
var srcPath = './src';
var webpackConfigPath = './webpack.config.js';

gulp.task('default', ['clean', 'webpack', 'copy']);

gulp.task('copy', function defaultTask() {
   var filter = gulpFilter(['**/*.json', '**/*.png', '**/*.html']);

    gulp.src(staticPath + '/**/*')
    .pipe(filter)
    .pipe(
        gulp.dest(outputPath)
    );
});

gulp.task('webpack', function webpackTask() {
    gulp.src(srcPath + '/Tiles')
      .pipe(gulpWebpack(require(webpackConfigPath) ))
      .pipe(gulp.dest(outputPath));
});

gulp.task('clean', function cleanTask(cb) {
    del([outputPath], cb);
});
