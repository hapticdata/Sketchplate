//#Hooks
//provides automated functionality to perform on already existing projects
require('colors');
var os = require('os'),
	spawn = require('child_process').spawn;


exports.initServer = require('./hooks/initServer');

exports.initRepo = function( location, fn ){
	var git = spawn( 'git', ['init', location] ).on('exit', function( code ){
		if( fn ) fn( code );
	});
	git.stdout.setEncoding('utf8');
	git.stdout.on('data', function ( data ){
		console.log( data.replace(/\n/,'').red );
	});
};

exports.npmInstall = function( location, fn ){
	var npmInstall = spawn( 'npm', ['install'], { cwd: location, stdio: 'inherit' } )
		.on('exit', function( code ){
			if( fn ) fn( code );
		});
};
exports.openInEditor = function( editorArgs, location, fn ){
	var token = "%path";
	var hasToken = false;
	var err = null;
	var params = editorArgs.slice(0);
	var cmd = params.shift();
	var pathIndex = params.indexOf(token);
	if( pathIndex > -1 ){
		hasToken = true;
		params.splice( pathIndex, 1, location );
	} else {
		//path wasnt found, maybe its a part of a string?
		for( var i=0, l = params.length; i<l; i++){
			if( params[i].indexOf(token) > -1 ){
				hasToken = true;
				params[i] = params[i].replace( /\%path/g, location );
			}
		}
	}
	if( !hasToken ){
		params.push( location );
	}
	//console.log( cmd + ': ', params );
	var editorProcess = spawn( cmd, params, { stdio: 'inherit'});
    editorProcess.on('exit', function ( code ){
		if( code !== 0){
			err = Error('Editor exited with code '.red+ code);
		}
		if ( fn ) fn( err );
	});
    /*editorProcess.stdout.on('data',function(data){
        console.log(data);
    });
    editorProcess.stderr.on('data',function(data){
        console.log(data);
    });*/
};

exports.openInFileBrowser = function( location, fn ){
	var commands = {
		'darwin': 'open',
		'win32': 'explorer',
		'linux': 'nautilus'
	};
	var cmd = commands[ os.platform() ];
	spawn( cmd, [location] ).on('exit', function( code ) {
		var err;
		if( code !== 0 ){
			err = Error('Error opening folder in file browser, exited with code '.red+ code );
		}
		if( fn ){
			fn( err );
		}
	});
};

//###Project constructor _`hooks.Project`_
//provides functionality on created-projects
//after the template has been copied
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
		exports.initRepo( this.location, fn );
		return this;
	},
	//####project.initServer(function(){})
	//initialize a static file server at the specified location
	//
	//* **{Object}** _[params] optional parameters
	//* **{Number}** _[params.port] optional port to use
	//* **{Function}** _[fn]_ callback, receives error object in params
	initServer: function( opts, fn ){
		if( arguments.length === 1 && typeof arguments[0] === 'function'){
			fn = opts;
			opts = {};
		}
		exports.initServer( this.location, opts, fn);
	},
	//####project.npmInstall(function (){})
	//run an npm install on the project
	//
	//*	**{Function}**	_[fn]_ callback, receives error object in params
	npmInstall: function( fn ){
		exports.npmInstall( this.location, fn );
		return this;
	},
	//####project.openInEditor(function (){})
	//opens location in text editor using _editorArgs_
	//
	//*	**{Function}** _[fn]_ optional callback, receives error as callback param
	openInEditor: function ( fn ){
		exports.openInEditor( this.editorArgs, this.location, fn );
		return this;
	},
	//####project.openInFileBrowser(function(){})
	//opens location in file browsers: Finder _(OSX)_, Explorer _(Win)_ or Nautilus _(Linux)_
	//
	//*	**{Function}** _[fn]_ optional callback
	openInFileBrowser: function( fn ) {
		exports.openInFileBrowser( this.location, fn );
		return this;
	}
};



exports.Project = Project;
