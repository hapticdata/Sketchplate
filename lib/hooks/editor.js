var spawn = require('win-spawn');
require('colors');

var sketchplatePath = require('../config').sketchplatePath;

/**
 * Launch your project in your editor
 * @param {String} location the path to your project
 * @param {Object} options
 * @param {Array} options.editorArgs the arguments used to launch your editor
 * @param {Function} callback(err, code)
 * @return {ChildProcess}
 */
module.exports = function( location, options, callback ){
    var editorArgs;
    //find editorArgs
    if( Array.isArray(options) ){
        editorArgs = options;
    } else if ( !options || !options.editorArgs || !options.editorArgs.slice ){
        throw new Error('Invalid `options.editorArgs` parameter');
    } else {
        editorArgs = options.editorArgs;
    }

    var cmd = editorArgs.shift();

    //be non-destructive
    editorArgs = editorArgs.slice(0);
    callback = callback || function(){};

    var tokens = [
        {
            regex: /\%path%/g,
            required: true,
            value: location
        },
        {
            regex: /\%sketchplate%/g,
            value: sketchplatePath
        }
    ];

    tokens.forEach(function( token ){
        for( var i=0, l=editorArgs.length; i<l; i++ ){
            //if its required but not there, append it as an argument
            if( token.required && !editorArgs[i].match(token.regex) ){
                editorArgs.push( token.value );
            } else {
                editorArgs[i] = editorArgs[i].replace(token.regex, token.value);
            }
        }
    });


    var editorProcess = spawn( cmd, editorArgs, {
        stdio: 'inherit'
    });

    editorProcess.on('exit', function ( code ){
        var error = null;
        if( code !== 0){
            error = new Error('Editor exited with code '.red+ code);
        }
        callback( error, code );
    });

    return editorProcess;
};
