'use strict';

import gulp from 'gulp'
import eslint from 'gulp-eslint'
import babel from 'gulp-babel'
import plumber from 'gulp-plumber'

gulp.task('lint', () => {
    return gulp.src('./src/*.js')
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('babel', () => {
    return gulp.src('./src/*.js')
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
    return gulp.watch('./src/*.js', ['babel']);
});

gulp.task('build', ['babel']);

gulp.task('default', ['build']);
