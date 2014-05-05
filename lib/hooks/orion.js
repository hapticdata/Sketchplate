var orion = require('orion'),
    browse = require('./browse'),
    http = require('http');


module.exports = function createOrion( path, opts, callback ){
    opts = opts || {};

    var editor = orion({ workspaceDir: path });
    var server = http.createServer( editor ).listen( 8081 );
    browse('http://0.0.0.0:8081');
};
