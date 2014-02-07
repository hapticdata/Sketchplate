var async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    ensureDirectory = require('./ensureDirectory'),
    request = require('request');



var download = function( file, callback ){
    request( file, function( err, response, body ){
        if( response && response.statusCode === 404 ){
            err = new Error("Error 404 retrieving "+file);
        }
        if ( err ) callback( err );
        else callback( null, body );
    });
};



//retrieve a resource from a text file
module.exports = function fromFile( resource, options, callback ){
    if( !resource.file ){
        callback(new Error('No file property'));
        return;
    }
    async.waterfall([
        function( next ){ download(resource.file, next); },
        function( body, next ){
            var pth = getTargetPath( resource.target );
            ensureDirectory( pth, function( err ){
                next( err, body );
            });
        },
        function write( body, next ){
            fs.writeFile( resource.target, body, function( err ){
                next( err, resource );
            });
        }
    ], function( err ){
        if( err ){
            err = new Error("Error fetching file: "+resource.file);
        }
        callback( err );
    });
};

//chop off the filename
function getTargetPath( src ){ return src.substr(0, src.lastIndexOf('/')); }
