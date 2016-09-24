'use strict'

import gulp from 'gulp'
import babel from 'gulp-babel'
import plumber from 'gulp-plumber'


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

gulp.task('default', ['watch']);
