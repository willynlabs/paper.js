/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2019, Juerg Lehni & Jonathan Puckey
 * http://scratchdisk.com/ & https://puckey.studio/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

var gulp = require('gulp'),
    prepro = require('gulp-prepro'),
    rename = require('gulp-rename'),
    uncomment = require('gulp-uncomment'),
    whitespace = require('gulp-whitespace'),
    del = require('del'),
    options = require('../utils/options.js');

// Options to be used in Prepro.js preprocessing through the global __options
// object, merged in with the options required above.
var buildOptions = {
    //full: { paperScript: true },
    //core: { paperScript: false },
    path2d: {paperScript: false }
};

var buildNames = Object.keys(buildOptions);

gulp.task('path2d',
    gulp.series(
        function(done) {
            gulp.src('src/path2d.js')
                .pipe(prepro({
                    // Evaluate constants.js inside the precompilation scope before
                    // the actual precompilation, so all the constants substitution
                    // statements in the code can work (look for: /*#=*/):
                    evaluate: ['src/constants.js'],
                    setup: function() {
                        // Return objects to be defined in the preprocess-scope.
                        // Note that this would be merged in with already existing
                        // objects.
                        return {
                            __options: Object.assign({}, options, buildOptions.path2d)
                        };
                    }
                }))
                .pipe(uncomment({
                    mergeEmptyLines: true
                }))
                .pipe(whitespace({
                    spacesToTabs: 4,
                    removeTrailing: true
                }))
                .pipe(gulp.dest('dist'));
            done();
        },
        function(done) {
            gulp.src(['src/node/*.js']).pipe(gulp.dest('dist/node'));
            done();
        },
        function(done) {
            done();
        }

));

