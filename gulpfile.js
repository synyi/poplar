const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

gulp.task('reload', function () {
    reload();
});

gulp.task('serve', function () {
    browserSync({
        server: {
            baseDir: '.'
        }
    });
    gulp.watch(['demo.html', 'src/**/*.js'], ['reload']);
});

gulp.task('clean:output', function () {
    return del([
        'src/**/*.js',
        'src/**/*.js.map'
    ]);
});
