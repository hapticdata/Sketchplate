var async = require('async'),
    _ = require('underscore'),
    glob = require('glob'),
    fs = require('graceful-fs'),
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
    //ensure tempDirectory ends with OS-appropriate delimiter
    if(tempDirectory.lastIndexOf(path.sep) !== tempDirectory.length -1){
        tempDirectory += path.sep;
    }
    //data structure is: [ [sources], [destinations] ]
    generateMap( tempDirectory, params[0], params[1], resource.exclude, callback );
};


var append = function( pre, val ){ return pre + val; };

//ensure there is a trailing slash on the directory
var trailSlash = function( dir ){
    return dir.lastIndexOf('/') === dir.length -1 ? dir : dir + '/';
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
        glob(k, { cwd: cwd, dot: true }, fn);
    };
    globifyTargets( cwd, globs, function( finalGlobs ){
        async.map(_.map(finalGlobs, _.partial(append,cwd)), globContent, function( err, sources ){
            if( err ){
                callback( err );
                return;
            }
            //remove the cwd from the resolved paths, for a relative-path
            sources = _.map(sources, function(sourceList, i ){
                return _.map( sourceList, function( s, j ){
                    return s.slice(cwd.length);
                });
            });
            callback( null, _.object(finalGlobs, sources) );
        });
    });
};


//if the resource object looks like { target: "destination/" }
var mapSimpleTarget = function( tempDirectory, resource ){
    return [ [''], [resource.target] ];
};

//if the resource object looks like { target: { 'src/' : 'dest/' } }
var mapComplexTarget = function( tempDirectory, resource ){
    return [ _.keys(resource.target), _.values(resource.target) ];
};

//generate a map of operations to perform
var generateMap = function( tempDirectory, sources, destinations, excludes, callback ){
    var resolveMap = function( sourceMap, callback ){
        var i = 0;
        var maps = _.map( sourceMap, function( relSrcs, glob ){
            var destination = destinations[i++];

            return _.map( relSrcs, function(src){
                var absSrc = tempDirectory + src;
                var g = glob;
                //if the glob was a wildcard there will be one level of
                //directory we wish to remove
                if(g.indexOf('**/*') >= 0){
                    g = g.slice(0, g.indexOf('**/*'));
                    src = src.slice(g.length);
                }
                //if its an individual file in the glob, make sure it doesnt end up
                //with a destination like package.json/package.json
                var dest = path.resolve(trailSlash(destination)+src);
                var badFilename = src + path.sep + src;
                if( dest.lastIndexOf(badFilename) === (dest.length - badFilename.length) ){
                    dest = dest.slice(0, -(path.sep+src).length);
                }
                return {
                    source: absSrc,
                    destination: dest,
                    isDirectory: fs.statSync(absSrc).isDirectory()
                };
            });
        });
        callback(null, _.flatten(maps) );
    };

    getRelativeSources( tempDirectory, sources, function( err, sourceMap ){
        if( err ){
            callback(err);
            return;
        }

        if( excludes && excludes.length ){
            getRelativeSources( tempDirectory, excludes, function( err, exclusions ){
                _.each( exclusions, function( excl, target ){
                    var wildCardIndex = target.indexOf('**/*');
                    if( wildCardIndex === target.length - '**/*'.length) {
                        excl.push( target.substr(0, target.indexOf('**/*')-1) );
                    }
                });
                exclusions = _.flatten(_.values(exclusions));
                var filterExclusions = function( src ){
                    return exclusions.indexOf( src ) < 0;
                };
                for( var target in sourceMap ){
                    sourceMap[target] = _.filter( sourceMap[target], filterExclusions );
                }
                resolveMap(sourceMap, callback);
            });
        } else {
            resolveMap(sourceMap, callback);
        }

    });
};


exports.globify = globifyTargets;
exports.getRelativeSources = getRelativeSources;
