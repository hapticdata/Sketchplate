/**
	FIXME This shouldnt check or a 'vendor/' folder this should
	check every library individually every time it creates a sketch
	and should verify that the file exists

	TODO add default app.build.js

	$sketchplate --update
	updates all libraries
	$sketchplate --update three datgui stats
	should update those libraries only
	usage:
		var sketchplate = require('sketchplate');
		sketchplate.create( '~/Sites/myProject' );
		sketchplate.openInEditor( '~/Sites/myProject' );

		--
		var Sketchplate = require('sketchplate').Sketchplate;
		var sketch = new Sketchplate({
			templateDir: '../template',
			target: '~/Sites/test',
			libraries: []
		});

		sketch.create(function (){
			sketch.openInEditor(sketch.gitInit);
		});
*/

var wrench = require('wrench'),
	spawn = require('child_process').spawn,
	fs = require('fs'),
	settings = require('../settings.json'),
	libraries = require('./library')(settings);


var red   = '\033[31m',
	blue  = '\033[34m',
	reset = '\033[0m';

var tmplDir = __dirname +'/'+ settings.templateDirectory;




function gitInit ( location, fn ){
	var git = spawn( 'git', ['init', location] )
		.on('exit', function ( code ){
			if( fn ) fn( code );
		});
	git.stdout.setEncoding('utf8');
	git.stdout.on('data', function ( data ){
		console.log(red+data.replace(/\n/,'')+reset);
	});
}


function create ( location, fn ){
	//get any missing libraries first
	maintainLibraries(function (err){
		//copy over template
		wrench.copyDirRecursive( tmplDir, location, function ( err ){
			if( err ){
				console.log( err );
			} else {
				console.log(red+'Project created at '+reset+location);
			}
			if( fn ) fn( err, location );
		});
	});
	return this;
}


var reportLibFetched = function ( lib, fn ){
	return function (err){
		if( err )
			throw err;
		console.log( red+'[added] '+reset, lib.id );
		if (fn) fn( err );
	};
};
function maintainLibraries (fn){
	var missingLibs = [];
	var checkLib = function (lib){
		if( !lib.exists() ) {
			missingLibs.push( lib );
		}
	};
	for(var i=0; i<libraries.length; i++){
		checkLib( libraries[i] );
	}
	console.log('missing #'+missingLibs.length);
	missingLibs.forEach(function (lib){
		var next = reportLibFetched(lib);
		lib.fetch(function ( err ){
			next(err);
			missingLibs.splice( missingLibs.indexOf(lib), 1 );
			if(missingLibs.length === 0) fn( err );
		});
	});

	if( missingLibs.length === 0 ) fn( null );
}


function fetchLibs (fn){
	libraries.forEach(function (lib){
		lib.fetch( reportLibFetched(lib,fn) );
	});
	return this;
}

function openInEditor ( location, fn ){
	var params = settings.editorArgs.slice(0);
	var cmd = params.shift();
	params.push( location );

	spawn( cmd, params )
		.on('exit', function ( code ){
			console.log(red+'Project opened in editor'+reset);
			if ( fn ) fn( code );
		});
}

exports.create = create;
exports.maintainLibraries = maintainLibraries;
exports.fetchLibs = fetchLibs;
exports.gitInit = gitInit;
exports.openInEditor = openInEditor;