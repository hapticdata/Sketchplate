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
	Project = require('./hooks').Project,
	buildLibrary = require('./library'),
	fs = require('fs');

/**
 * creates a handler for handling a retrieved lib
 * @api private
 */
var reportLibFetched = function ( lib, fn ){
	return function (err){
		if( err ){
			if( fn ) {
				fn( err );
			} else {
				throw err;
			}
		}
		console.log( '+\t'+colors.red+'fetched '+colors.reset, lib.id );
		if (fn){
			fn( err );
		}
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
	var errors = [];
	var missingLibs = [];
	//create an Error that lists the collection of errors from fetching
	function createError(){
		var msg = ["Fetch reported the following errors: "];
		errors.forEach(function( err ){
			msg.push("-  "+err.message);
		});
		return Error( msg.join("\n") );
	}
	//find missing libs
	libs.forEach(function( lib ){
		if( !lib.exists() ) {
			missingLibs.push( lib );
		}
	});
	//for every missing library fetch it,
	//if an error occurs collect the errors and report at the end
	missingLibs.forEach(function (lib){
		var next = reportLibFetched(lib);
		lib.fetch(function ( err ){
			//if there was an error, collect it until the end
			//otherwise log a successful fetch
			if( err ){ errors.push( err ); }
			else { next(); }
			missingLibs.splice( missingLibs.indexOf(lib), 1 );
			if(missingLibs.length === 0){
				err = null;
				if( errors.length > 0 ){
					err = createError();
				}
				fn( err );
			}
		});
	});
	//if there never was a missing lib
	if( missingLibs.length === 0 ) fn( null );
};

var base = __dirname + '/../templates';
//###Sketchplate
var Sketchplate = function( settings ){
	this.templateDirectory = base+'/'+settings.template + '/template';
	var json;
	var body;
	try {
		body = fs.readFileSync(base+'/'+settings.template+'/template.json');
		json = JSON.parse( body );
		this.javascripts = buildLibrary(this.templateDirectory, json, 'fetch');
		this.editorArgs = settings.editorArgs;
	} catch( e ){
		throw Error(colors.red+'Unable to locate template.json for template "' + settings.template + '"'+colors.reset );
	}
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
		this.fetchMissingLibs(function ( err ){
			if( err ) {
				fn( err );
				return;
			}
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
exports.create = function ( settings ){
	settings = settings || require('../settings.json');
	//console.log('received template: '+settings.template);
	return new Sketchplate( settings );
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