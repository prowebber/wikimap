let gulp = require('gulp');
var minify = require('gulp-minify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function() {
	// place code for your default task here
	gulp.start('compress');
});

gulp.task('compress', function() {
	gulp.src('./output.js')
		.pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(minify({
				ext:{
					src:'-debug.js',
					min:'.js'
				},
				exclude: ['tasks'],
				ignoreFiles: ['.combo.js', '-min.js']
			}))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(''))
});