'use strict';
var gulp = require('gulp');
var bump = require('gulp-bump');
var git = require('git-promise');
var inquirer = require('inquirer');

/**
 * Bumps a patch version
 * @return {[type]} [description]
 */
gulp.task('bump', function(){
  gulp.src('./package.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));

  gulp.src('./public/bower.json')
  .pipe(bump())
  .pipe(gulp.dest('./public'));
});


gulp.task('commit', function (){

	inquirer.prompt([{
		type : 'input',
		name : 'msg',
		message : 'Commit message?',
		default : 'I refuse to provide a commit message.'
	}], 

	function (answers) {
		git('add -A').then(function () {
			git('commit -am "' + answers.msg + '"')

			.fail(console.error);
		})	.fail(console.error);
		

	});
});

gulp.task('push-github', function () {
	git('push github master')

	.fail(console.error);
	
});

gulp.task('push-origin', function () {
	git('push origin master')

	.fail(console.error);

});

gulp.task('next', ['bump', 'commit', 'push-github']);
gulp.task('up',   ['bump', 'commit', 'push-github', 'push-origin']);


