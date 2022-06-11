const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imageMin = require('gulp-imagemin');
const htmlMin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();
const del = require('del');

const paths = {
   publicDir: './public',
   html: {
      src: 'src/*.html',
      dest: 'public/',
   },
   styles: {
      src: ['src/styles/**/*.scss', 'src/styles/**/*.css'],
      dest: 'public/css/',
   },
   scripts: {
      src: 'src/scripts/**/*.js',
      dest: 'public/js/',
   },
   images: {
      src: 'src/img/**',
      dest: 'public/img/',
   },
};

const clean = () => del(['public/*', '!public/img']);

const html = () => {
   return gulp
      .src(paths.html.src)
      .pipe(htmlMin({ collapseWhitespace: true }))
      .pipe(
         size({
            showFiles: true,
         }),
      )
      .pipe(gulp.dest(paths.html.dest))
      .pipe(browserSync.stream());
};

const styles = () => {
   return gulp
      .src(paths.styles.src)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(
         autoprefixer({
            cascade: false,
         }),
      )
      .pipe(
         cleanCSS({
            level: 2,
         }),
      )
      .pipe(
         rename({
            basename: 'index',
            suffix: '.min',
         }),
      )
      .pipe(sourcemaps.write('.'))
      .pipe(
         size({
            showFiles: true,
         }),
      )
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream());
};

const scripts = () =>
   gulp
      .src(paths.scripts.src)
      .pipe(sourcemaps.init())
      .pipe(
         babel({
            presets: ['@babel/env'],
         }),
      )
      .pipe(uglify())
      .pipe(concat('index.min.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(
         size({
            showFiles: true,
         }),
      )
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(browserSync.stream());

function img() {
   return gulp
      .src(paths.images.src)
      .pipe(newer(paths.images.dest))
      .pipe(
         imageMin({
            progressive: true,
         }),
      )
      .pipe(
         size({
            showFiles: true,
         }),
      )
      .pipe(gulp.dest(paths.images.dest));
}

const watch = () => {
   browserSync.init({
      server: {
         baseDir: paths.publicDir,
      },
   });
   gulp.watch(paths.html.dest).on('change', browserSync.reload);
   gulp.watch(paths.html.src, html);
   gulp.watch(paths.styles.src, styles);
   gulp.watch(paths.scripts.src, scripts);
   gulp.watch(paths.images.src, img);
};

exports.clean = clean;

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;
exports.watch = watch;

exports.default = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch);
