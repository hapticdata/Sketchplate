var fs = require('fs'),
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
	folderExists: function( folder ){
		try {
			fs.statSync( folder );
		} catch ( e ){
			return false;
		}
		return true;
	},
	exists: function (){
		//if its a single target
		if (typeof this.target === 'string'){
			return this.folderExists( this.target );
		} else {
			//multiple targets
			for (var prop in this.target){
				if( !this.folderExists(this.target[prop]) ){
					return false;
				}
			}
			return true;
		}
	},
	fetch: function ( fn ){
		var callback = function( err ){ if( fn ) fn( err ); };
		return fetch( this, callback );
	}
};