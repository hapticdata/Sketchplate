var async = require('async'),
    _ = require('underscore'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');



var append = function( pre, val ){ return pre + val; };
var appendAll = function( prefix, list ){
    return list.map(_.partial(append,prefix));
};


var isDirectory = function( absGlob, callback ){
    fs.stat( absGlob, function( err, stat ){
        //if its an Error, IGNORE
        callback( null, stat ? stat.isDirectory() : false );
    });
};

//this just safety-guards that folders will have their wildcards
//in order to get individual file lists
//DOES NOT ERROR, callback( pathGlobs )
var globifyTargets = function( cwd, pathGlobs, callback ){
    var absGlobs = pathGlobs.map(_.partial(append,cwd));
    async.mapSeries( absGlobs, isDirectory, function( err, isDirs ){
        //never an error
        pathGlobs = isDirs.map(function( isDir, i ){
            return pathGlobs[i] + (isDir ? '**/*' : '');
        });
        callback( pathGlobs );
    });
};

//get the globs back from the target keys
var getRelativeSources = function( cwd, pathGlobs, callback ){
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


//returns [ { source:String, destination:String } ]
var handleSimpleTarget = function( resource, callback ){
    //copy entire thing
    callback( null, [{ source: '', destination: resource.target }]);
};




var handleComplexTarget = function( originDirectory, resource, callback ){
    var sources = _.keys(resource.target),
        destinations = _.values(resource.target);


    getRelativeSources( originDirectory, sources, function( err, sourceMap ){
        var globs = _.keys( sourceMap);

        var maps = _.map( globs, function( glob, i ){
            var destination = destinations[i],
                relSrcs = _.values(sourceMap)[i];

           return _.map( relSrcs, function(src){
               var absSrc = originDirectory + src;
               return {
                   source: absSrc,
                   destination: path.normalize(destination+src),
                   isDirectory: fs.statSync(absSrc).isDirectory()
               };
           });
        });

        callback(null, _.flatten(maps) );
    });
};


module.exports = exports = function( originDirectory, resource, callback ){
    (typeof resource.target === 'string' ?
        handleSimpleTarget :
        handleComplexTarget
    )( originDirectory, resource, callback );
};

exports.handleComplexTarget = handleComplexTarget;

exports.globify = globifyTargets;
exports.getRelativeSources = getRelativeSources;
