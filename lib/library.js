
var fs = require('fs'),
	path = require('path'),
	fetch = require('./fetch');


module.exports = function buildLibrary( root, settings, key ){
	var libs = [];
	var id, prop;
	for( id in settings[key]){
		var libInfo = {};
		for( prop in settings[key][id] ){
			libInfo[prop] = settings[key][id][prop];
		}
		libInfo.id = id;
		//if its a string, add the project root to its target
		if(typeof libInfo.target === 'string'){
			libInfo.target = root + '/' + libInfo.target;
		} else {
			//if its an object of targets, add the project root to each target
			for( prop in libInfo.target ){
				libInfo.target[prop] = root + '/' + libInfo.target[prop];
			}
		}
		libs.push( new Library( libInfo ) );
	}
	return libs;
};




var Library = function ( params ){
	for( var prop in params ){
		this[prop] = params[prop];
	}
};

Library.prototype = {
	constructor: Library,
	exists: function (){
		try {
			fs.statSync( this.target );
		} catch ( e ){
			return false;
		}
		return true;
	},
	fetch: function ( fn ){
		var callback = function(){ if( fn ) fn(); };
		return fetch( this, fn );
	}
};


/*function makeLibraries ( templateDirectory ){



var makeLibrary = function ( templateDirectory ){
	return Backbone.Model.extend({
		defaults: {
			templateDirectory: templateDirectory
		},
		fetch: function ( fn ){
			var ftch = new Fetch();
			ftch.on('exit', fn );
			ftch.retrieveLib( templateDirectory, this.attributes, this.id);
			return this;
		},
		exists: function ( ){
			return fs.existsSync( this.get('templateDirectory') + this.get('target') );
		}
	});
};

var Libraries = Backbone.Collection.extend({
	model: makeLibrary( templateDirectory ),
	initialize: function (){
		if ( !this.options.templateDirectory) throw new Error("Missing templateDirectory in collection");
		this.model = makeLibrary( this.options.templateDirectory );
	},

	exists: function ( index ){
		var lib = this.at( index );
		return fs.existsSync( this.templateDirectory + lib.get('target') );
	}
});

};
exports.makeLibraries = makeLibraries;*/