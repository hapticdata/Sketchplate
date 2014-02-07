var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore'),
    copyFile = require('./copyFile');
    ensureDirectory = require('./ensureDirectory');

/**
 * For a single operation, make the write
 * @param operations
 * @param callback
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
            copyFile(op.source, op.destination, next);
        }, callback);
    });
};




exports.ensureDirectory = ensureDirectory;
exports.writeFile = writeFile;