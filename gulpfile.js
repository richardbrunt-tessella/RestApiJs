
var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
// var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');

// gulp helper
var gzip = require('gulp-gzip');
var del = require('del');
var rename = require('gulp-rename');

// path tools
var path = require('path');
var join = path.join;
var mkdirp = require('mkdirp');

// browserify build config
var buildDir = "build";
var browserFile = "browser.js";
var packageConfig = require('./package.json');
var outputFile = packageConfig.name;

// auto config for browserify
var outputFileSt = outputFile + ".js";
// var outputFilePath = join(buildDir,outputFileSt);
var outputFileMinSt = outputFile + ".min.js";
var outputFileMin = join(buildDir,outputFileMinSt);

// a failing test breaks the whole build chain
gulp.task('default', ['lint', 'test', 'build-browser', 'build-browser-gzip']);

gulp.task('lint', function() {
    return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', ['build-browser'], function () {
    return gulp.src('./test/*.js', {read: false})
        .pipe(mocha({
            reporter: 'spec',
            useColors: false
        })
    );
});

gulp.task('watch', function() {
    gulp.watch(['./src/**/*.js','./lib/**/*.js','./test/**/*.js'], ['build-browser', 'test', 'lint']);
});


// will remove everything in build
gulp.task('clean', function() {
    return del([buildDir]);
});

// just makes sure that the build dir exists
gulp.task('init', ['clean'], function() {
    mkdirp(buildDir, function (err) {
        if (err) console.error(err);
    });
});

// browserify debug
gulp.task('build-browser',['init'], function() {
    return gulp.src(browserFile)
        .pipe(browserify({debug:true}))
        .pipe(rename(outputFileSt))
        .pipe(gulp.dest(buildDir));
});

// browserify min
gulp.task('build-browser-min',['init'], function() {
    return gulp.src(browserFile)
        .pipe(browserify({}))
        .pipe(uglify())
        .pipe(rename(outputFileMinSt))
        .pipe(gulp.dest(buildDir));
});

gulp.task('build-browser-gzip', ['build-browser-min'], function() {
    return gulp.src(outputFileMin)
        .pipe(gzip({append: false, gzipOptions: { level: 9 }}))
        .pipe(rename(outputFile + ".min.gz.js"))
        .pipe(gulp.dest(buildDir));
});
