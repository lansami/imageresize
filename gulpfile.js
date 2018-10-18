const gulp = require('gulp');

gulp.task('default', function(){
    gulp.src('src/views/*.ejs')
        .pipe(gulp.dest('dist/views'));
    gulp.src('src/config.json')
        .pipe(gulp.dest('dist'))
});