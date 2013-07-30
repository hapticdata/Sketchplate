//Config module, parses config files and holds defaults
var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench');


function getDefaults(){ return path.normalize( __dirname + '/../defaults' ); }
//~/
exports.userHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
exports.defaultConfig = getDefaults()+'/config.json';
exports.defaultFetch = getDefaults()+'/fetch.json';
exports.userDirectory = exports.userHome + '/.sketchplate';
exports.userFetch = exports.userDirectory + '/fetch.json';
exports.userConfig = exports.userDirectory + '/config.json';
//{Config} constructor
function Config( c ){
	this.originalProperties = [];
	for( var prop in c ){
		this[prop] = c[prop];
		this.originalProperties.push( prop );
	}
	if( this.path === undefined ){
		this.path = exports.userHome+'/.sketchplate/';
	}
	//convert user directories
	var self = this;
	['path', 'templatesPath'].forEach(function( p ){
		if( self[p].indexOf('~') === 0 ){
			self[p] = exports.userHome+self[p].substr(1,self[p].length);
		}
	});

	this.writeUserConfig = function( cb ){
		exports.writeUserConfig( this, cb );
	};
	this.writeConfig = function( path, cb ){
		exports.writeConfig( path, this, cb );
	};
}

//copy file synchronously with fs
var copyFileSync = function(srcFile, destFile) {
    var buffLength = 64 * 1024;
    var _buff = new Buffer(buffLength);
    var bytesRead, fdr, fdw, pos;
    fdr = fs.openSync(srcFile, 'r');
    fdw = fs.openSync(destFile, 'w');
    bytesRead = 1;
    pos = 0;
    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, _buff, 0, buffLength, pos);
        fs.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
    }
    fs.closeSync(fdr);
    return fs.closeSync(fdw);
};


//take {Config} and strip it back to the original json structure
var _makeConfig = function( self ){
	var o = {};
	self.originalProperties.forEach(function( prop ){
		o[prop] = self[prop];
	});
	return o;
};


exports.Config = Config;
//get the default settings for sketchplate
exports.getDefaultConfig = function(){
	return exports.load( exports.defaultConfig );
};
//get the users current settings for sketchplate
exports.getUserConfig = function(){
	//if the default config doesnt exist, create it synchronously
	if( !fs.existsSync(exports.userDirectory) ){
		exports.installSync();
	}
    if( !fs.existsSync(exports.userConfig)){
        exports.installConfigDefaults();
    }
    if( !fs.existsSync(exports.userFetch) ){
        exports.installFetchDefaults();
    }
	return exports.load( exports.userConfig );
};
//copy the `defaults` contents into the user dir
exports.installSync = function(){
	//this is the first time sketchplate has been ran
	wrench.copyDirSyncRecursive( getDefaults(), path.dirname( exports.userConfig ), { preserveFiles:true } );
};
//if the .sketchplate folder exists but not the config, copy it over
exports.installConfigDefaults = function(){
    copyFileSync( getDefaults() + '/config.json', exports.userConfig);
};
//if you already had sketchplate installed but not the fetch.json just copy it over
exports.installFetchDefaults = function(){
    copyFileSync( getDefaults() + '/fetch.json', exports.userFetch );
};
//load any config file
exports.load = function( config ){
	return new exports.Config( require( config ) );
};
//restore configuration file at `path` with the `defaults`
exports.restoreConfig = function( path, cb ){
	var defaultConf = exports.getDefaultConfig();
	exports.writeConfig( path, defaultConf, cb);
};
//restore the user's configuration file with the `default`
exports.restoreUserConfig = function( cb ){
	exports.restoreConfig( exports.userConfig, cb );
};
//write ther user's configuration file with {Config} newConfig
exports.writeUserConfig = function( newConfig, cb ){
	exports.writeConfig( exports.userConfig, newConfig, cb );
};
//write at `path` {Config} newConfig
exports.writeConfig = function( path, newConfig, cb ){
	var body = JSON.stringify( _makeConfig(newConfig), null, '\t');
	fs.writeFile( path , body, cb);
};
