var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('reload', function(){
	reload();
});

gulp.task('serve', function() {
	browserSync({
		server: {
			baseDir: '.'
		}
	});
	gulp.watch(['src/*.ts', 'demo.html', 'src/*.js'], ['reload']);
});
