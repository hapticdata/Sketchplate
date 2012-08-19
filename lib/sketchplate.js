/*global console, exports, __dirname*/
/**
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
	colors = require('./colors'),
	buildLibrary = require('./library');


/**
 * creates a handler for handling a retrieved lib
 * @api private
 */
var reportLibFetched = function ( lib, fn ){
	return function (err){
		if( err )
			throw err;
		console.log( colors.red+'[fetched] '+colors.reset, lib.id );
		if (fn) fn( err );
	};
};

var fetchAll = function ( libs, fn ){
	libs.forEach(function (lib){
		lib.fetch( reportLibFetched(lib,fn) );
	});
};

var fetchMissing = function ( libs, fn ){
	var missingLibs = [];
	var checkLib = function (lib){
		if( !lib.exists() ) {
			missingLibs.push( lib );
		}
	};
	for(var i=0; i<libs.length; i++){
		checkLib( libs[i] );
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
};

var SketchPlate = function( destination, settings ){
	this.templateDirectory = __dirname + '/../' + settings.templateDirectory;
	this.javascriptsDirectory = this.templateDirectory + '/' + settings.javascriptsDirectory;
	this.javascripts = buildLibrary(settings, 'javascripts');
	this.editorArgs = settings.editorArgs;
	this.destination = destination;
};

SketchPlate.prototype = {
	/**
	 * copies the template to a new directory,
	 * will retrieve any missing libraries first
	 * @param {String} location of the project to create
	 * @param {String} [fn] callback function will receive error param and location
	 * @api public
	 */
	copyTemplate: function ( fn ){
		//get any missing libraries first
		var self = this;
		this.fetchMissingLibs(function (){
			//copy over template
			wrench.copyDirRecursive( self.templateDirectory, self.destination, function ( err ){
				if( err ){
					console.log( 'err: ',err );
				} else {
					console.log(colors.red+'Project created at '+colors.reset+self.destination);
				}
				if( fn ) fn( err, self.destination );
			});
		});
		return this;
	},
	/**
	* initializes a git repository at the specified location
	* @param {String} location to init repo
	* @param {Function} [fn] callback, receieves error object in params
	* @api public
	*/
	initRepo: function ( fn ){
		var git = spawn( 'git', ['init', this.destination] )
			.on('exit', function ( code ){
				if( fn ) fn( code );
			});
		git.stdout.setEncoding('utf8');
		git.stdout.on('data', function ( data ){
			console.log(colors.red+data.replace(/\n/,'')+colors.reset);
		});
	},
	/**
	* searches for all missing libraries and copies them
	* @param {Function} [fn] optional callback receives param fn( error ) in callback
	* @api public
	*/
	fetchMissingLibs: function (fn){
		fetchMissing( this.javascripts, fn );
		return this;
	},
	/**
	* downloads all libraries and copies them into the template
	* @param {Function} [fn] callback once all libraries are retrieved
	* @api public
	*/
	fetchAllLibs: function (fn){
		fetchAll( this.javascripts, fn );
		return this;
	},
	/**
	* opens location in text editor using editorArgs
	* @param {String} location of project
	* @param {Fnction} [fn] optional callback, receives exit code as callback param
	*/
	openInEditor: function ( fn ){
		var params = this.editorArgs.slice(0);
		var cmd = params.shift();
		params.push( this.destination );

		spawn( cmd, params ).on('exit', function ( code ){
			console.log(colors.red+'Project opened in editor'+colors.reset);
			if ( fn ) fn( code );
		});
	}
};

exports.create = function ( destination, settings ){
	settings = settings || require('../settings.json');
	if( destination === undefined ) throw Error("Invalid destination passed");
	return new SketchPlate( destination, settings );
};
exports.fetchMissingLibsFor = function ( settings, fn ){
	var javascripts = buildLibrary( settings, 'javascripts' );
	fetchMissing( javascripts, fn );
};
exports.fetchAllLibsFor = function ( settings, fn ){
	var javascripts = buildLibrary( settings,'javascripts' );
	fetchAll( javascripts, fn );
};
exports.SketchPlate = SketchPlate;