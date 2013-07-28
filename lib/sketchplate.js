//#Sketchplate v0.1.0
//by [Kyle Phillips](http://haptic-data.com)
//(MIT License)
//
//	**_Basic use:_**
//
//		sketchplate = require('sketchplate');
//		settings = {
//			editorArgs: ["subl", "%path"],
//			template: "amd-sketch",
//			templatesPath: "../templates"
//		};
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
//
//**Fetch libs by name _(in `template.json`)_:**
//
//		resources = ['jquery','modernizr','bootstrap'];
//		plate.fetch(resources, function( errors ){
//			//if any errors it will be an array
//		});
//
//**Direct access to fetch _(not tied to any template)_:**
//
//		sketchplate.fetch({
//			file: "http://code.jquery.com/jquery.js",
//			target: "javascripts/vendor/jquery.js"
//		}, function callback( errors ){
//			//if any errors it will be an array
//		});

require('colors');

var wrench = require('wrench'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	Project = require('./hooks').Project,
	buildLibrary = require('./library'),
	fs = require('fs');

//###Sketchplate constructor
//exported as sketchplate.Sketchplate
var Sketchplate = function( config ){
	var base = config.templatesPath;
	this.config = config;
	this.templatesPath = base+'/'+config.template + '/template';
	var json;
	var body;
	try {
		body = fs.readFileSync(base+'/'+config.template+'/template.json');
		json = JSON.parse( body );
		this.resources = buildLibrary(this.templatesPath, json, 'fetch');
		this.editorArgs = config.editors[ config.editor ];
	} catch( e ){
		throw Error('Unable to locate template.json for template "'.red + config.template + '" at location `'+this.templatesPath+'` ');
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
		this.fetchMissing(function ( err ){
			if( err ) {
				fn( err );
				return;
			}
			//copy over template without writing over any existing files
			try {
				wrench.copyDirSyncRecursive( self.templatesPath, destination, { preserve: true, preserveFiles: true } );
				console.log('Project created at '.red+destination);
			} catch (e) {
				console.error( e.message );
				err = e;
			}
			if( fn ) fn( err, new Project( destination, self.editorArgs) );

		});
		return this;
	},
	//downloads specified resource(s) and copies them into the template
	//
	//* **{Function}** _[fn]_ callback once resources are retrieved
	fetch: function( resources, fn ){
		var errors = [];
		if (typeof resources[0] === 'string'){
			//its the name of resources i.e. ['jquery', 'async']
			//find their objects from `template.json`
			var names = resources;
			resources = [];
			var self = this;
			names.forEach(function( name ){
				var res = self.getResource( name );
				if( res !== undefined ){
					resources.push( res );
				} else {
					errors.push( Error("Error finding resource "+name+" in the template") );
				}
			});
		}
		//fetch the resurces and collect errors
		exports.fetch( resources, function( err ){
			if( err ){
				errors.push( err );
			}
			if( errors.length === 0 ){
				errors = undefined;
			}
			fn( errors );
		});
		return this;
	},
	//downloads all libraries and copies them into the template
	//
	//*	**{Function}** _[fn]_ callback once all libraries are retrieved
	fetchAll: function (fn){
		fetchAll( this.resources, fn );
		return this;
	},
	//searches for all missing libraries and copies them
	//
	//*	**{Function}** _[fn]_ optional callback receives param fn( error ) in callback
	fetchMissing: function (fn){
		fetchMissing( this.resources, fn );
		return this;
	},
	//get a resource by name
	//
	//* **{String}** name, name of resource to get
	getResource: function( name ){
		for( var i=0, l = this.resources.length; i<l; i++){
			var res = this.resources[i];
			if( res.id.toLowerCase() === name.toLowerCase() ){
				return res;
			}
		}
	},
    //install a template
    //
    //* **{String}** pckg, the package to install
    installTemplate: function( pckg, folder, fn ){
        exports.installTemplate( this, pckg, folder, fn );
    }
};


//constructs a new Sketchplate instance
//
//*	**{String}** destination, the destination folder
//*	**{Object}** settings, settings object, such as `settings.json`
exports.create = function ( settings, fn ){
	if( fn ){
		var plate;
		try{
			plate = new Sketchplate( settings );
			fn( null, plate );
		} catch( e ){
			fn( err );
		}
	} else {
		return new Sketchplate( settings );
	}
};
//creates a new blank template
exports.createTemplate = function ( settings, opts, fn ){
	var tmpJSON = [
		'{',
		'\t"name": "'+opts.name+'",',
		'\t"version": "0.0.0",',
		'\t"author": "",',
		'\t"description": "'+opts.description+'",',
		'\t"fetch": {}',
		'}'
	].join('\n');
	var tmplDir = settings.templatesPath +'/'+ opts.name;
	mkdirp( settings.templatesPath + '/' + opts.name + '/template', function( err ){
		if( err ){
			fn( err );
			return;
		}
		fs.writeFile( tmplDir + '/template.json', tmpJSON, function( err ){
			fn( null, tmplDir );
		});
	});
};

//install a template
//
//* **{String}** package, the url or reference for downloading the template
exports.installTemplate = function( settings, packg, folder, fn ){
    var ftch = {};
    if( packg.indexOf('://') > 0 ){
        if( packg.indexOf('.zip') > 0 ){
            ftch.zip = packg;
        } else {
            ftch.clone = packg;
        }
        ftch.target = packg.slice( packg.lastIndexOf('/')+1, packg.length );
    } else if( packg.indexOf('/') > 0 ){
        ftch.clone = 'https://github.com/'+packg+'.git';
        ftch.target = packg.slice( packg.indexOf('/')+1, packg.length );
    } else {
        fn( new Error('improper package supplied') );
        return;
    }
    //if the folder param wasn't provided, but a callback was
    if( arguments.length === 3 && typeof arguments[2] === 'function' ){
        fn = arguments[2];
        folder = undefined;
    }
    //if a folder was specified use that
    if( folder && folder.length ){
        ftch.target = folder;
    }
    ftch.target = settings.templatesPath + '/' + ftch.target;
    //fetch it
    exports.fetch( ftch, fn );
};

exports.removeTemplate = function( settings, name, fn ){
	var tmplDir = settings.templatesPath +'/'+name;
	wrench.rmdirRecursive( tmplDir, fn );
};
//full-access to `fetch`
exports.fetch = require('./fetch');
//full-access to `hooks`
exports.hooks = require('./hooks');

//fetch all libs in the settings that aren't in the folder
//
//*	**{Object}** settings, settings object such as `settings.json`
//*	**{Function}** fn, optional callback receives `(error)`
exports.fetchMissingFor = function ( settings, fn ){
	var resources = buildLibrary( settings, 'resources' );
	fetchMissing( resources, fn );
};
//fetch and update all libs in the settings
//
//*	**{Object}** settings, settings object such as `settings.json`
//* **{Function}** fn, optional callback receives `(error)`
exports.fetchAllFor = function ( settings, fn ){
	var resources = buildLibrary( settings,'resources' );
	fetchAll( resources, fn );
};


//open an existing project
exports.openProject = function ( location, settings ){
	return new Project( location, settings.editorArgs );
};
exports.Sketchplate = Sketchplate;


/**
 * creates a handler for reporting the status of a fetch
 * @api private
 */
function reportLibFetched( lib, fn ){
	return function (err){
		if( err ){
			if( fn ) {
				fn( err );
			} else {
				throw err;
			}
		}
		console.log( '+\tfetched '.red, lib.id );
		if (fn){
			fn( err );
		}
	};
}

/* @api private */
function fetchAll( libs, fn ){
	libs.forEach(function (lib){
		lib.fetch( reportLibFetched(lib,fn) );
	});
}
/* @api private */
function fetchMissing( libs, fn ){
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
}
