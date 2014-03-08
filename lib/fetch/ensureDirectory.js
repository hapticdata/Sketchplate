var fs = require('fs'),
    mkdirp = require('mkdirp');
/**
 * if the directory doesn't exist already, create it
 * @param {String} directory
 * @param {Function} callback( error )
 */
module.exports = function ensureDirectory( directory, callback ){
    fs.exists(directory, function( exists ){
        if( exists ){
            callback();
            return;
        }
        mkdirp( directory, callback);
    });
};
