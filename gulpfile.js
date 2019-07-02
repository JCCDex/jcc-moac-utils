const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('watch', function() {
  gulp.watch(['src/**/*.ts'], shell.task('npm run tslint'));
});

gulp.task('tslint', shell.task('npm run tslint'));
gulp.task('test', shell.task('npm run test:browser && npm run test:node'));
gulp.task('default', gulp.parallel(['tslint', 'test']));
gulp.task('dev', gulp.parallel(['tslint', 'watch']));