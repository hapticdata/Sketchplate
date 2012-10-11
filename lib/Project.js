//Project provides functionality on created-projects
//after the template has been copied

var colors = require('./colors'),
	spawn = require('child_process').spawn;

function Project ( location, editorArgs ){
	this.location = location;
	this.editorArgs = editorArgs;
}

Project.prototype = {
	constructor: Project,
	//####project.initRepo(function (){})
	//initializes a git repository at the specified location
	//
	//*	**{Function}** _[fn]_ callback, receieves error object in params
	initRepo: function ( fn ){
		var git = spawn( 'git', ['init', this.location] )
			.on('exit', function ( code ){
				if( fn ) fn( code );
			});
		git.stdout.setEncoding('utf8');
		git.stdout.on('data', function ( data ){
			console.log(colors.red+data.replace(/\n/,'')+colors.reset);
		});
		return this;
	},
	//####project.npmInstall(function (){})
	//run an npm install on the project
	//
	//*	**{Function}**	_[fn]_ callback, receives error object in params
	npmInstall: function( fn ){
		var npmInstall = spawn( 'npm', ['install'], { cwd: this.location } )
			.on('exit', function( code ){
				if( fn ) fn( code );
			});
		npmInstall.stdout.setEncoding('utf8');
		npmInstall.stdout.on('data', function( data ){
			console.log( data );
		});
		return this;
	},
	//####project.openInEditor(function (){})
	//opens location in text editor using _editorArgs_
	//
	//*	**{String}** location of project
	//*	**{Function}** _[fn]_ optional callback, receives exit code as callback param
	openInEditor: function ( fn ){
		var params = this.editorArgs.slice(0);
		var cmd = params.shift();
		params.push( this.location );

		spawn( cmd, params ).on('exit', function ( code ){
			if( code === 0){
				console.log(colors.red+'Project opened in editor'+colors.reset);
			} else {
				console.log(colors.red+'Editor exited with code '+ code+colors.reset);
			}
			if ( fn ) fn( code );
		});
		return this;
	}
};

module.exports = Project;