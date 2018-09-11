'use strict';


var gulp = require('gulp'),
    debug = require('gulp-debug'),
    del = require('del'),
    inlineCss = require('gulp-inline-css'),
    plumber = require('gulp-plumber'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    mail = require('gulp-mail'),
    rename = require('gulp-rename'),
    pugI18n = require('gulp-i18n-pug');


var paths = {
    dir: {
        app: './app',
        dist: './dist'
    },
    watch: {
        html: './app/pug/**/*.pug',
        css: './app/sass/**/*.scss'
    },
    app: {
        html: {
            src: './app/pug/*.pug',
            dest: './app'
        },
        locale: {
            src: "./app/locale/*.yml"
        },
        css: {
            src: [
                './app/sass/styles/inline.scss',
                './app/sass/styles/media.scss'
            ],
            dest: './app/css'
        }
    },
    dist: {
        src: './app/email.html',
        distsrc: './dist/email.html',
        trans: './dist/trans/',
        srcDat: './dist/email.dat',
        dest: './dist'
    }
};

var emailUser = 'email';
var emailPassword = 'password';



var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

gulp.task('dat', function (done) {
    gulp.src(paths.dist.distsrc)
        .pipe(rename(paths.dist.srcDat))
        .pipe(gulp.dest("./"));
    done();
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: paths.dir.app,
            index: 'email.html'
        }
    });
    gulp.watch([paths.watch.html, paths.watch.css], gulp.series('build'));
    gulp.watch('*.html').on('change', reload);
});

gulp.task('html', function() {
    return gulp.src(paths.app.html.src)
        .pipe(plumber())
        .pipe(debug({title: 'Pug source'}))
        .pipe(pug({
            pretty: true,
            doctype: 'HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"'
        }))
        .pipe(debug({title: 'Pug'}))
        .pipe(gulp.dest(paths.app.html.dest))
        .pipe(debug({title: 'Pug dest'}))
        .pipe(browserSync.stream());
});

gulp.task('css', function() {
    return gulp.src(paths.app.css.src)
        .pipe(plumber())
        .pipe(debug({title: 'Sass source'}))
        .pipe(sass())
        .pipe(debug({title: 'Sass'}))
        .pipe(gulp.dest(paths.app.css.dest))
        .pipe(debug({title: 'Sass dest'}))
        .pipe(browserSync.stream());
});

gulp.task('clean', function() {
    return del(paths.dir.dist);
});

gulp.task('inline', function() {
    return gulp.src(paths.dist.src)
        .pipe(plumber())
        .pipe(debug({title: 'Inline CSS sourse'}))
        .pipe(inlineCss({
            preserveMediaQueries: true,
            applyTableAttributes: true
        }))
        .pipe(debug({title: 'Inline CSS'}))
        .pipe(gulp.dest(paths.dist.dest))
        .pipe(debug({title: 'Inline CSS dest'}));
});

gulp.task('build', gulp.series('html', 'css', 'clean', 'inline', 'dat'));

gulp.task('default', gulp.series('build', 'serve'));


var smtpInfo = {
    auth: {
        user: emailUser,
        pass: emailPassword
    },
    host: 'smtp.gmail.com',
    secureConnection: true,
    port: 465
};

gulp.task('mail', function () {
    return gulp.src('./dist/email.dat')
        .pipe(mail({
            subject: 'gmail',
            to: [
                'v.sharapat@gmail.com'
            ],
            from: 'Foo <v.sharapat@gmail.com>',
            smtp: smtpInfo
        }));
});

gulp.task('pugI18n', function () {
    var options = {
        i18n: {
            dest: './dist/trans/',
            locales: './app/locale/*.*'
        },
        pretty: true
    };
    return gulp.src('./app/pug/*.pug')
        .pipe(pugI18n(options))
        .pipe(gulp.dest(options.i18n.dest));
});
// gulp.task('hello', function() {
//     console.log('Hello world!')
// });