
let gulp = require('gulp')
let babel = require('gulp-babel')
let newer = require('gulp-newer')
let stylus = require('gulp-stylus')
let rename = require('gulp-rename')

let paths = {
    public: 'public',
    client: ['public/app.js'],
    clientBuild: 'public/build/',
    css: ['public/*.styl'],
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

gulp.task('build:css', () =>
    gulp.src(paths.css)
    .pipe(stylus({
        compress: true
    }))
    .pipe(rename({
        basename: 'styles',
        extname: '.css'
    }))
    .pipe(gulp.dest(paths.public))
)

gulp.task('watch', ['default'], function() {
    gulp.watch(paths.client, ['build:client'])
    gulp.watch(paths.css, ['build:css'])
})

gulp.task('default', ['build:client', 'build:css'])
