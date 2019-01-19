"use strict";

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const nunjucksRender = require('gulp-nunjucks-render');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const path = require("path");


// Source Directories
const sourceNpmModules = 'node_modules'
const sourceNpmJavascriptFiles = [
  path.join(sourceNpmModules, 'jquery/dist/jquery.js'),
  path.join(sourceNpmModules,'popper.js/dist/umd/popper.js'),
  path.join(sourceNpmModules,'bootstrap/dist/js/bootstrap.js'),
];
const sourceJavascriptFiles = 'js/**/*.js';
const sourceStaticFiles = 'static/**/*.*';
const sourceSassFiles = 'sass/**/*.scss';
const sourceViewsFiles = 'views/**/*.nj';

// Destination directories
const destDirectory = 'build';
const destStaticDirectory = destDirectory;
const destHtmlDirectory = destDirectory;
const destCssDirectory = path.join(destDirectory, '/css');
const destJavascriptDirectory = path.join(destDirectory, 'js');
const destJavascriptVendorDirectory = path.join(destDirectory, 'js/vendor');
const destHtmlFiles = path.join(destDirectory, "/**/*.html");
const destJavascriptFiles = path.join(destDirectory, "/js/**/*.js");


// Clean all files in destDirectory
function cleanTask (cb) {
    return gulp.src(destDirectory, {read: false, allowEmpty: true})
        .pipe(clean());
}

// Copy Javascript files in sourceStaticDirectory to destStaticDirectory
function javascriptCopyFiles (cb) {
    return gulp.src(sourceJavascriptFiles)
        .pipe(gulp.dest(destJavascriptDirectory));
}

// Copy Javascript Vendor files in sourceStaticDirectory to destStaticDirectory
function javascriptCopyVendor (cb) {
    return gulp.src(sourceNpmJavascriptFiles)
        .pipe(gulp.dest(destJavascriptVendorDirectory));
}

// Copy Static files in sourceStaticDirectory to destStaticDirectory
function staticCopy (cb) {
    return gulp
        .src(sourceStaticFiles)
        .pipe(gulp.dest(destStaticDirectory));
}

// Sass
function sassBuild (cb) {
    return gulp.src(sourceSassFiles)
        .pipe(sourcemaps.init())
        .pipe(sass({ style: 'expanded', sourceComments: 'map', errLogToConsole: true }))
        .on('error', sass.logError)
        .pipe(sourcemaps.write())
        .pipe(autoprefixer('last 2 version', "> 1%", 'ie 8', 'ie 9'))
        .pipe(gulp.dest(destCssDirectory))
        .pipe(browserSync.stream());
}

// Compile views in Nunjucks Format
function viewsBuild (cb) {
    return gulp.src(sourceViewsFiles)
        .pipe(nunjucksRender({
          path: ['views']
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(destHtmlDirectory))
        .pipe(browserSync.stream())
}

// // Browser Sync
function watchAll (cb) {

  browserSync.init({
    server: destDirectory
  });

  gulp.watch(sourceSassFiles, sassBuild);
  gulp.watch(sourceViewsFiles, viewsBuild);
  gulp.watch(sourceJavascriptFiles, javascriptCopyFiles);
  gulp.watch(sourceNpmJavascriptFiles, javascriptCopyVendor);

  gulp.watch(destHtmlFiles).on('change', browserSync.reload);
  gulp.watch(destJavascriptFiles).on('change', browserSync.reload);
}

const buildTask = gulp.series(cleanTask, gulp.parallel(staticCopy, sassBuild, viewsBuild, javascriptCopyFiles, javascriptCopyVendor))
const serveTask = gulp.series(buildTask, watchAll)

exports.build = buildTask
exports.serve = serveTask
exports.clean = cleanTask
// Default Task
exports.default = serveTask
