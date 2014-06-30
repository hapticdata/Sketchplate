var async = require('async'),
    _ = require('underscore'),
    copyFile = require('./copyFile'),
    ensureDirectory = require('./ensureDirectory');

/**
 * For a single operation, make the write
 * @param {Array} operations an Array of objects with `source, destination, isDirectory` keys
 * @param {Function} callback( err )
 */
module.exports = exports = function( operations, callback ){
    var directories = _.filter(operations, function(o){ return o.isDirectory; }),
        files = _.difference(operations, directories);
    //create all of the directories first
    async.mapSeries(_.pluck(directories,'destination'), ensureDirectory, function( err ){
        if( err ){
            callback( err );
            return;
        }
        async.map(files, function(op, next){
            var pth = getTargetPath(op.destination);
            ensureDirectory( pth, function(err){
                if( err ){
                    next(err);
                    return ;
                }
                copyFile(op.source, op.destination, next);
            });
        }, callback);
    });
};

//chop off the filename
function getTargetPath( src ){ return src.substr(0, src.lastIndexOf('/')); }
