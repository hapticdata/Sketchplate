//Config module, parses config files and holds defaults
var fs = require('fs'),
	path = require('path'),
    _ = require('underscore'),
	wrench = require('wrench');


//the internal defaults folder
function getDefaults(){ return path.normalize( __dirname + '/../defaults' ); }
//~/
exports.userHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
exports.defaultConfig = getDefaults()+'/config.json';
exports.defaultFetch = getDefaults()+'/fetch.json';
exports.userDirectory = exports.userHome + '/.sketchplate';
exports.userFetch = exports.userDirectory + '/fetch.json';
exports.userConfig = exports.userDirectory + '/config.json';

function swapLeader( from, to, pth ){
    if( pth && pth.indexOf(from) === 0 ){
        return to + pth.substr(from.length, pth.length);
    }
    return pth;
}

var tildeToHome = _.partial(swapLeader, '~', exports.userHome);
var homeToTilde = _.partial(swapLeader, exports.userHome, '~');


/**
 * extract the indices from the list,
 * @param list
 * @param indices
 * @returns {Array}
 */
function extract( list, indices ){
    return _.map(indices, function(index){
        return list[index];
    });
}

exports.parseConfig = function( c ){
    c = _.clone(c);
    return _.extend( c, {
        originalKeys: _.keys(c),
        path: tildeToHome(c.path || '~/.sketchplate/'),
        templatesPath: tildeToHome(c.templatesPath),
        writeUserConfig: _.partial(exports.writeUserConfig, c),
        writeConfig: _.partial(exports.writeConfig, c)
    });
};


//copy file synchronously with fs
var copyFileSync = function( srcFile, destFile ){
    fs.writeFileSync(destFile, fs.readFileSync(srcFile));
};

//take {Config} and strip it back to the original json structure
var restoreFileFormat = function( conf ){
    var o = extract( conf, conf.originalKeys );
    o = _.object( conf.originalKeys, o );
    if( o.path ){
        o.path = homeToTilde( o.path );
    }
    o.templatesPath = homeToTilde( o.templatesPath );
    return o;
};


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
exports.installConfigDefaults = _.partial( copyFileSync, exports.defaultConfig, exports.userConfig );

//if you already had sketchplate installed but not the fetch.json just copy it over
exports.installFetchDefaults = _.partial( copyFileSync, exports.defaultFetch, exports.userFetch );

//load any config file
exports.load = function( config ){
	return exports.parseConfig( require(config) );
};

//restore configuration file at `path` with the `defaults`
exports.restoreConfig = function( path, cb ){
	var defaultConf = exports.getDefaultConfig();
	exports.writeConfig( path, defaultConf, cb);
};

//write at `path` {Config} newConfig
exports.writeConfig = function( path, newConfig, cb ){
	var body = JSON.stringify( restoreFileFormat(newConfig), null, '\t');
	fs.writeFile( path , body, cb);
};

//restore the user's configuration file with the `default`
exports.restoreUserConfig = _.partial(exports.restoreConfig, exports.userConfig);

//write ther user's configuration file with {Config} newConfig
exports.writeUserConfig = _.partial( exports.writeConfig, exports.userConfig );

