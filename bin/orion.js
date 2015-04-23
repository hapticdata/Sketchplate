var orion = require('orion'),
    browse = require('../lib/sketchplate').hooks.openInFileBrowser,
    serverHook = require('../lib/hooks/server'),
    http = require('http');

var address = 'http://localhost',
    port = 8000;

if( process.argv.length > 2 ){
    createOrion( process.argv[2], {}, function(){
        console.log( 'Orion editor launched at ' + address +', '+'Ctrl+c to stop'.cyan );
    });
}

function createOrion( path, opts, callback ){
    callback = callback || function(){};
    opts = opts || {};

    var editor = orion({ workspaceDir: path });

    var onComplete = function( err, server, editor, port ){
        address += ':' + port;
        browse(address);
        callback();
    };

    serverHook.tryToMakeServer( editor, { incrementPortOnError: true, port: 8000 }, onComplete );
}
