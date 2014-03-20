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
    async = require('async'),
    _ = require('underscore'),
	Project = require('./hooks').Project,
	buildLibrary = require('./library'),
	fs = require('fs');

//###Sketchplate constructor
//exported as sketchplate.Sketchplate
var Sketchplate = function( config ){
	var base = config.templatesPath;
	this.config = config;
	this.templatePath = base+'/'+config.template + '/template';
	var json;
	var body;
	try {
		body = fs.readFileSync(base+'/'+config.template+'/template.json');
		json = JSON.parse( body );
        this.resources = buildLibrary( this.templatePath, json.fetch );
		this.editorArgs = config.editors[ config.editor ];
	} catch( e ){
		throw Error('Unable to locate template.json for template "'.red + config.template + '" at location `'+this.templatePath+'` ');
	}
};

Sketchplate.prototype = {
	//copies the template to a new directory,
	//will retrieve any missing libraries first, then provides a [Project](./Project.html)
	//
	//* **{String}** destination, the location to copy files
	//*	**{Function}** fn, callback function will receive `(error, [project](./Project.html))`
	copyTemplate: function ( destination, fn, onProgress ){
        fn = fn || function(){};
        onProgress = onProgress || function(){};
		//get any missing libraries first
		var self = this;
		this.fetchMissing(function ( err ){
			if( err ) {
				fn( err );
				return;
			}
			//copy over template without writing over any existing files
			try {
				wrench.copyDirSyncRecursive( self.templatePath, destination, { preserve: true, preserveFiles: true } );
			} catch (e) {
				err = e;
			}
			fn( err, new Project( destination, self.editorArgs) );
		}, onProgress);
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
	fetchAll: function (onComplete, onProgress){
		fetchAll( this.resources, onComplete, onProgress );
		return this;
	},
	//searches for all missing libraries and copies them
	//
	//*	**{Function}** _[fn]_ optional callback receives param fn( error ) in callback
	fetchMissing: function (onComplete, onProgress){
		fetchMissing( this.resources, onComplete, onProgress );
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
    //* **{String}** [folder], the destination
    //* **{Function}** [fn], the callback
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
		} catch( err ){
			fn( err );
		}
	} else {
		return new Sketchplate( settings );
	}
};
//creates a new blank template
exports.createTemplate = require('./templates/create');

//install a template
exports.installTemplate = require('./templates/install');

//remove an installed template (delete directory)
exports.removeTemplate = require('./templates/remove');

//full-access to `fetch`
exports.fetch = require('./fetch');

//full-access to `hooks`
exports.hooks = require('./hooks');

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
    fn = fn || function(){};
	return function (err){
		if( err ){
            fn( err );
		}
		console.log( '+\tfetched '.red, lib.id );
        fn( err, lib );
	};
}

/* @api private */
function fetchAll( libs, onComplete, onProgress  ){
    onComplete = onComplete || function(){};
    onProgress = onProgress || function(){};

    async.forEach( libs, function(lib, fn){
        lib.fetch(function(err){
            onProgress( err, lib );
        });
    }, onComplete);
}
/* @api private */
function fetchMissing( libs, onComplete, onProgress ){
    onComplete = onComplete || function( err ){};
    onProgress = onProgress || function( err, lib ){};

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
		lib.fetch(function ( err ){
			//if there was an error, collect it until the end
			//otherwise log a successful fetch
			if( err ){
                errors.push( err );
            }
            onProgress( err, lib );
			missingLibs.splice( missingLibs.indexOf(lib), 1 );
			if(missingLibs.length === 0){
				err = null;
				if( errors.length > 0 ){
					err = createError();
				}
				onComplete( err );
			}
		});
	});
	//if there never was a missing lib
	if( missingLibs.length === 0 ) onComplete( null );
}
