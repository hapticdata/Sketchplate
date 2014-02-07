var async = require('async'),
    _ = require('underscore'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');


/**
 * generate a map of file operations to perform
 * @type {Function}
 * @param {String} tempDirectory the temporary-directory the source files are located in
 * @param {{ target:String|Object }} resource
 * @param {Function} callback( error, [ { source:String, destination:String, isDirectory:Boolean } ])
 */
module.exports = exports = function( tempDirectory, resource, callback ){
    var params = (typeof resource.target === 'string' ?
        mapSimpleTarget :
        mapComplexTarget
        )( tempDirectory, resource );
    //data structure is: [ [sources], [destinations] ]
    generateMap( tempDirectory, params[0], params[1], callback );
};


var append = function( pre, val ){ return pre + val; };

//ensure there is a trailing slash on the directory
var trailSlash = function( path ){
    return path.lastIndexOf('/') === path.length -1 ? path : path + '/';
};

//stat to find if its a directory
//don't report errors cause these are still the raw globs, non-directories wont exist
var isDirectory = function( absGlob, callback ){
    fs.stat( absGlob, function( err, stat ){
        //if its an Error, IGNORE
        callback( null, stat ? stat.isDirectory() : false );
    });
};

/**
 * @private
 * append * * / * wildcard to directory
 * in order to get individual file lists
 * @param {String} cwd the current working directory
 * @param {Array<String>} pathTargets the targets i.e [ 'src/', '*.json' ]
 * @param {Function} callback( pathGlobs )
 */
 var globifyTargets = function( cwd, pathTargets, callback ){
    var absGlobs = pathTargets.map(_.partial(append,cwd));
    async.mapSeries( absGlobs, isDirectory, function( err, isDirs ){
        //never an error
        pathTargets = isDirs.map(function( isDir, i ){
            return isDir ? trailSlash(pathTargets[i]) + '**/*' : pathTargets[i];
        });
        callback( pathTargets );
    });
};

/**
 * @public
 * get the relative paths for all source files from the target keys
 * @param {String} cwd the current working directory for glob-matching
 * @param {Array} globs the strings of patterns to match
 * @param callback( error, sourceMap:Object )
 */
var getRelativeSources = function( cwd, globs, callback ){
    var globContent = function(k,fn){
        glob(k, { cwd: cwd }, fn);
    };
    globifyTargets( cwd, pathGlobs, function( globs ){
        async.map( globs, globContent, function( err, sources ){
            if( err ){
                callback( err );
                return;
            }
            callback( null, _.object(globs, sources) );
        });
    });
};


//if the resource object looks like { target: "destination/" }
var mapSimpleTarget = function( tempDirectory, resource ){
    return [ [tempDirectory], [resource.target] ];
};

//if the resource object looks like { target: { 'src/' : 'dest/' } }
var mapComplexTarget = function( tempDirectory, resource ){
    return [ _.keys(resource.target), _.values(resource.target) ];
};

//generate a map of operations to perform
var generateMap = function( tempDirectory, sources, destinations, callback ){
    getRelativeSources( tempDirectory, sources, function( err, sourceMap ){
        if( err ){
            callback(err);
            return;
        }

        var maps = _.map( _.keys(sourceMap), function( glob, i ){
            var destination = destinations[i],
                relSrcs = _.values(sourceMap)[i];

            return _.map( relSrcs, function(src){
                var absSrc = tempDirectory + src;
                return {
                    source: absSrc,
                    destination: path.resolve(destination+src),
                    isDirectory: fs.statSync(absSrc).isDirectory()
                };
            });
        });
        callback(null, _.flatten(maps) );
    });
};


exports.globify = globifyTargets;
exports.getRelativeSources = getRelativeSources;
