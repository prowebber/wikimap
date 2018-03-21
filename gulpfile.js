let gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('default', function() {
	// place code for your default task here
	gulp.start('compress');
});

gulp.task('compress', function() {
	gulp.src('./output.js')
		.pipe(minify({
			ext:{
				src:'-debug.js',
				min:'.js'
			},
			exclude: ['tasks'],
			ignoreFiles: ['.combo.js', '-min.js']
		}))
		.pipe(gulp.dest(''))
});