import * as gulp from 'gulp';
import * as del from 'del';
import * as runSequence from 'run-sequence';
import * as sourceMaps from 'gulp-sourcemaps';
import * as tsc from 'gulp-typescript';
import * as gulpCopy from 'gulp-copy';
var tsimport = require('./tsimport');


gulp.task('clean:dist/common',
  () => {
    return del(['./dist/common']);
  }
);

gulp.task('clean:dist/server',
  () => {
    return del(['./dist/server']);
  }
);

gulp.task('build:common',
  () => {
    const tsProject = tsc.createProject('./nfx-common/tsconfig.json');
    const tsResult = gulp.src('./nfx-common/**/*.ts')
      .pipe(sourceMaps.init())
      .pipe(tsProject());
    return tsResult.js
      .pipe(sourceMaps.write(null, null))
      .pipe(gulp.dest('./dist/common'));      
  }
);

gulp.task('build:server',
  () => {
    const tsProject = tsc.createProject('./nfx-server/tsconfig.json');
    const tsResult = gulp.src('./nfx-server/src/**/*.ts')
      .pipe(sourceMaps.init())
      .pipe(tsProject());      
    return tsResult.js
      .pipe(tsimport(tsProject.config.compilerOptions, 'common'))
      .pipe(sourceMaps.write(null, null))
      .pipe(gulp.dest('./dist/server'));      
  }
);

gulp.task('copy:keys',
  () => {
    return gulp
      .src('./nfx-server/key/*.*')
      .pipe(gulp.dest('./dist/server/key/'));
  }
);

gulp.task('copy:dbcon',
  () => {
    return gulp
      .src('./nfx-server/dbcon/*.*')
      .pipe(gulp.dest('./dist/server/dbcon/'));
  }
);

gulp.task('default',
  () => {
    runSequence(
      'clean:dist/common',
      'clean:dist/server',
      'build:common',
      'build:server',
      'copy:keys',
      'copy:dbcon'
    );
  }
);
