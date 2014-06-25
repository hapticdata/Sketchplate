var spawn = require('child_process').spawn;
require('colors');

var sketchplatePath = require('../config').sketchplatePath;

module.exports = function( editorArgs, location, callback ){
    var cmd = editorArgs.shift();
    if( !editorArgs.slice ){
        throw new Error('Invalid `editorArgs` parameter');
    }
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
