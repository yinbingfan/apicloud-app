//严格模式
'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var gulpLoadPlugins = require('gulp-load-plugins');
var postcss = require('gulp-postcss');
var pxtorem = require('postcss-pxtorem');

//node-sass 编译
gulp.task('sass', function () {
    var processors = [
        pxtorem({
            replace: false,
            rootValue: 75,
            propWhiteList: [],
            //忽略样式
            selectorBlackList: [],
        })
    ];
    return gulp.src('./sdk/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                'Android >= 4',
                'iOS >= 9'
            ],
            cascade: false
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./sdk/css'));
});

//watch 监控
gulp.task('watch', function () {
    gulp.watch('./sdk/sass/**/*.scss', ['sass']);
});
