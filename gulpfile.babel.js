import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglifyJS2 from 'gulp-uglify'; // minify UglifyJS2
import uglify from 'gulp-uglify-es'; // minify ES6 compatible
import cleanCSS from 'gulp-clean-css';
// FS
import rename from 'gulp-rename';
import run from 'gulp-run';
import del from 'del';
// IMG + FONTS
import imagemin from 'gulp-imagemin';
import fontgen from 'gulp-fontgen';
// SERVER
import { create } from 'browser-sync';
const server = create();

// apidoc.json
const apidocJSONFile = './apidoc.json';
const apidocJSON = require( apidocJSONFile );

// APIDOC PATHS

const entryFile = 'index.html';
const repoRoot = "../../";
const dist = '../';
const paths = {
  styles: {
    src: 'scss/style.scss',
    dest: dist + 'css/'
  },
  scripts: {
    src: 'js/**/*.js',
    dest: dist
  },
  img: {
    src: 'img/**/*.{jpg,jpeg,png,gif,svg}',
    dest: dist + 'img/',
  },
  fonts: {
    src: 'fonts/**/*.{ttf,otf}',
    dest: dist + 'fonts/',
  },
  entry: dist + entryFile
};

// export const clean = () => { /*** OPTIONAL ***/}

const styles = () => {
  return gulp.src( paths.styles.src )
    .pipe( sass() )
    .pipe( cleanCSS() )
    // pass in options to the stream
    .pipe( rename({
      basename: 'style',
      // suffix: '.min'
    }) )
    .pipe( gulp.dest( paths.styles.dest ) )
    .pipe( server.stream() );
};

const scripts = () => {
  return gulp.src( paths.scripts.src, { sourcemaps: false })
  // .pipe(babel())
  .pipe( uglify() )
  .pipe( concat( 'main.js' ) )
  .pipe( gulp.dest( paths.scripts.dest ) );
};

// IMAGES

export const images = () => {
  return gulp.src( paths.img.src )
  .pipe( imagemin( [
    imagemin.jpegtran({ progressive: true }),
    imagemin.gifsicle({ interlaced: true }),
    imagemin.svgo({ plugins: [
      { removeUnknownsAndDefaults: false },
      { cleanupIDs: false }
    ] })
  ] ) )
  .pipe( gulp.dest( paths.img.dist ) )
  .pipe( bs.stream() );
};


// FONTS

export const fonts = () => {
  return gulp.src( paths.fonts.src )
    .pipe( fontgen({ dest: paths.fonts.dist }) );
};

// APIDOCS CREATION

export const docs = () => {
  return run( 'npm run docs' ).exec();
};

// LOCAL SERVER

const serve = () => {
  server.init({
    server: {
      baseDir: dist,
      index: entryFile,
    },
    port: 3000,
    open: true,
    browser: [ "google-chrome" ], // 'firefox'
    logFileChanges: true,
    logLevel: "debug",
  });
};

// WATCH

export const watch = () => {
  serve();
  gulp.watch( paths.scripts.src, gulp.series( scripts, server.reload ) );
  gulp.watch( paths.styles.src, styles );
  gulp.watch( paths.img.src, gulp.series( images, server.reload ) );
  gulp.watch( paths.fonts.src, gulp.series( fonts, server.reload ) );
  gulp.watch( paths.entry ).on( "change", server.reload );
  gulp.watch( [
    "../../src/api/**/*",
    apidocJSONFile,
    apidocJSON.header.filename,
    apidocJSON.footer.filename ], docs );
};

// DEFAULT

gulp.task( 'start', gulp.series( gulp.parallel( scripts, styles ), watch ) );
gulp.task( 'default', gulp.series( gulp.parallel( scripts, styles ), watch ) );
