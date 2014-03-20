var spawn = require('child_process').spawn;
require('colors');

module.exports = function( editorArgs, location, callback ){
    if( !editorArgs.slice ){
        throw new Error('Invalid `editorArgs` parameter');
    }
    //be non-destructive
    editorArgs = editorArgs.slice(0);
    callback = callback || function(){};
    var token = "%path",
        hasToken = false,
        cmd = editorArgs.shift(),
        pathIndex = editorArgs.indexOf(token);

    if( pathIndex > -1 ){
        //one of the args is a token
        hasToken = true;
        editorArgs.splice( pathIndex, 1, location );
    } else {
        //path wasnt found, maybe its a part of a string?
        for( var i=0, l = editorArgs.length; i<l; i++){
            if( editorArgs[i].indexOf(token) > -1 ){
                hasToken = true;
                editorArgs[i] = editorArgs[i].replace( /\%path/g, location );
            }
        }
    }
    if( !hasToken ){
        editorArgs.push( location );
    }

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
