/*global console, exports, __dirname*/
/**
	TODO add default app.build.js

	TODO update individual libraries
	$sketchplate --update three datgui stats
	should update those libraries only
*/

//	**_Basic use:_**
//
//		sketchplate = require('sketchplate');
//		settings = require('../settings.json');
//
//**Create a new Sketchplate instance:**
//
//		plate = sketchplate.create( settings );
//
//**Fetch any missing libraries then copy template:**
//
//		plate.copyTemplate('~/Sites/myProject', function (err, project){
//			if (err) throw err;
//			project.initRepo();
//			project.openInEditor();
//		});
//
//**Fetch new copies of all libraries:**
//
//		plate.fetchAllLibs(function (err){
//			if(err)throw err;
//		});

var wrench = require('wrench'),
	colors = require('./colors'),
	Project = require('./Project'),
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

/* @api private */
var fetchAll = function ( libs, fn ){
	libs.forEach(function (lib){
		lib.fetch( reportLibFetched(lib,fn) );
	});
};
/* @api private */
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


//###Sketchplate
var Sketchplate = function( settings ){
	this.templateDirectory = __dirname + '/../' + settings.templateDirectory;
	this.javascriptsDirectory = this.templateDirectory + '/' + settings.javascriptsDirectory;
	this.javascripts = buildLibrary(settings, 'javascripts');
	this.editorArgs = settings.editorArgs;
};

Sketchplate.prototype = {
	//copies the template to a new directory,
	//will retrieve any missing libraries first, then provides a [Project](./Project.html)
	//
	//* **{String}** destination, the location to copy files
	//*	**{Function}** fn, callback function will receive `(error, [project](./Project.html))`
	copyTemplate: function ( destination, fn ){
		//get any missing libraries first
		var self = this;
		this.fetchMissingLibs(function (){
			//copy over template
			wrench.copyDirRecursive( self.templateDirectory, destination, function ( err ){
				if( err ){
					console.log( 'err: ',err );
				} else {
					console.log(colors.red+'Project created at '+colors.reset+destination);
				}
				if( fn ) fn( err, new Project( destination, self.editorArgs) );
			});
		});
		return this;
	},
	//searches for all missing libraries and copies them
	//
	//*	**{Function}** _[fn]_ optional callback receives param fn( error ) in callback
	fetchMissingLibs: function (fn){
		fetchMissing( this.javascripts, fn );
		return this;
	},
	//downloads all libraries and copies them into the template
	//
	//*	**{Function}** _[fn]_ callback once all libraries are retrieved
	fetchAllLibs: function (fn){
		fetchAll( this.javascripts, fn );
		return this;
	}
};


//constructs a new Sketchplate instance
//
//*	**{String}** destination, the destination folder
//*	**{Object}** settings, settings object, such as `settings.json`
exports.create = function ( destination, settings ){
	settings = settings || require('../settings.json');
	if( destination === undefined ) throw Error("Invalid destination passed");
	return new Sketchplate( destination, settings );
};

//fetch all libs in the settings that aren't in the folder
//
//*	**{Object}** settings, settings object such as `settings.json`
//*	**{Function}** fn, optional callback receives `(error)`
exports.fetchMissingLibsFor = function ( settings, fn ){
	var javascripts = buildLibrary( settings, 'javascripts' );
	fetchMissing( javascripts, fn );
};
//fetch and update all libs in the settings
//
//*	**{Object}** settings, settings object such as `settings.json`
//* **{Function}** fn, optional callback receives `(error)`
exports.fetchAllLibsFor = function ( settings, fn ){
	var javascripts = buildLibrary( settings,'javascripts' );
	fetchAll( javascripts, fn );
};
//open an existing project
exports.openProject = function ( location, settings ){
	return new Project( location, settings.editorArgs );
};
exports.Sketchplate = Sketchplate;