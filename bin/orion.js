var orion = require('orion'),
    browse = require('../lib/sketchplate').hooks.openInFileBrowser,
    http = require('http');

if( process.argv.length > 2 ){
    createOrion( process.argv[2] );
    console.log( 'Orion editor launched, '+'Ctrl+c to stop'.cyan );
}

function createOrion( path, opts, callback ){
    opts = opts || {};

    var editor = orion({ workspaceDir: path });
    var server = http.createServer( editor ).listen( 8081 );
    browse('http://0.0.0.0:8081');
};
