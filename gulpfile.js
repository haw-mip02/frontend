
let gulp = require('gulp')
let babel = require('gulp-babel')
let newer = require('gulp-newer')
let stylus = require('gulp-stylus')

let paths = {
    client: ['public/app.js'],
    clientBuild: 'public/build/',
    css: ['*.styl'],
}

gulp.task('build:client', () =>
    gulp.src(paths.client)
    .pipe(newer(paths.clientBuild))
    .pipe(babel({
        plugins: [
            'syntax-async-functions',
            'transform-async-to-generator',
            'transform-es2015-modules-commonjs',
            'transform-exponentiation-operator'
        ]
    }))
    .pipe(gulp.dest(paths.clientBuild))
)

gulp.task('watch', ['build:client'], function() {
    gulp.watch(paths.client, ['build:client'])
})

gulp.task('default', ['build:client'])
