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
gulp.task('clean', function () {
    return gulp.src(destDirectory, {read: false})
        .pipe(clean());
});

// Copy Static files in sourceStaticDirectory to destStaticDirectory
gulp.task('javascript', function () {
     return gulp.src(sourceJavascriptFiles)
             .pipe(gulp.dest(destJavascriptDirectory));
});

// Copy Static files in sourceStaticDirectory to destStaticDirectory
gulp.task('javascript:vendor', function () {
     return gulp.src(sourceNpmJavascriptFiles)
             .pipe(gulp.dest(destJavascriptVendorDirectory));
});

// Copy Static files in sourceStaticDirectory to destStaticDirectory
gulp.task('static', function () {
     return gulp
             .src(sourceStaticFiles)
             .pipe(gulp.dest(destStaticDirectory));
});

// Sass
gulp.task('sass', function () {
  return gulp.src(sourceSassFiles)
    .pipe(sourcemaps.init())
    .pipe(sass({ style: 'expanded', sourceComments: 'map', errLogToConsole: true }))
    .on('error', sass.logError)
    .pipe(sourcemaps.write())
    .pipe(autoprefixer('last 2 version', "> 1%", 'ie 8', 'ie 9'))
    .pipe(gulp.dest(destCssDirectory))
    .pipe(browserSync.stream());
});

// Compile views in Nunjucks Format
gulp.task('views', function () {
  return gulp.src(sourceViewsFiles)
    .pipe(nunjucksRender({
      path: ['views']
    }))
    .on('error', gutil.log)
    .pipe(gulp.dest(destHtmlDirectory))
    .pipe(browserSync.stream())
});

// Browser Sync
gulp.task('browserSync', ['static', 'sass', 'views', 'javascript', 'javascript:vendor'], function() {

  browserSync.init({
    server: destDirectory
  });
  
  gulp.watch(sourceSassFiles, ['sass']);
  gulp.watch(sourceViewsFiles, ['views']);
  gulp.watch(sourceJavascriptFiles, ['javascript']);
  gulp.watch(sourceNpmJavascriptFiles, ['javascript:vendor']);

  gulp.watch(destHtmlFiles).on('change', browserSync.reload);
  gulp.watch(destJavascriptFiles).on('change', browserSync.reload);
});

// Build files
gulp.task('build', ['clean'], function() {
  gulp.start('static'); 
  gulp.start('sass');
  gulp.start('views');
  gulp.start('javascript');
  gulp.start('javascript:vendor');
});

// Clean Build + Static files with Browser Sync
gulp.task('serve', ['clean'], function() {
  gulp.start('browserSync'); 
});

// Default Task
gulp.task('default', ['serve']);
