/**
	FIXME This shouldnt check or a 'vendor/' folder this should
	check every library individually every time it creates a sketch
	and should verify that the file exists

	TODO add default app.build.js

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


/**
 * creates a new project,
 * will retrieve any missing libraries first
 * @param {String} location of the project to create
 * @param {String} [fn] callback function will receive error param and location
 * @api public
 */
function create ( location, fn ){
	//get any missing libraries first
	fetchMissingLibs(function (err){
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

/**
 * initializes a git repository at the specified location
 * @param {String} location to init repo
 * @param {Function} [fn] callback, receieves error object in params
 * @api public
 */
function initRepo ( location, fn ){
	var git = spawn( 'git', ['init', location] )
		.on('exit', function ( code ){
			if( fn ) fn( code );
		});
	git.stdout.setEncoding('utf8');
	git.stdout.on('data', function ( data ){
		console.log(red+data.replace(/\n/,'')+reset);
	});
}

/**
 * creates a handler for handling a retrieved lib
 * @api private
 */
var reportLibFetched = function ( lib, fn ){
	return function (err){
		if( err )
			throw err;
		console.log( red+'[fetched] '+reset, lib.id );
		if (fn) fn( err );
	};
};

/**
 * searches for all missing libraries and copies them
 * @param {Function} [fn] optional callback receives param fn( error ) in callback
 * @api public
 */
function fetchMissingLibs (fn){
	var missingLibs = [];
	var checkLib = function (lib){
		if( !lib.exists() ) {
			missingLibs.push( lib );
		}
	};
	for(var i=0; i<libraries.length; i++){
		checkLib( libraries[i] );
	}
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

/**
 * downloads all libraries and copies them into the template
 * @param {Function} [fn] callback once all libraries are retrieved
 * @api public
 */
function fetchAllLibs (fn){
	libraries.forEach(function (lib){
		lib.fetch( reportLibFetched(lib,fn) );
	});
	return this;
}

/**
 * opens location in text editor using editorArgs
 * @param {String} location of project
 * @param {Fnction} [fn] optional callback, receives exit code as callback param
 */
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
exports.fetchMissingLibs = fetchMissingLibs;
exports.fetchAllLibs = fetchAllLibs;
exports.initRepo = initRepo;
exports.openInEditor = openInEditor;