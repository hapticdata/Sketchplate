var spawn = require('child_process').spawn,
    _ = require('underscore');

module.exports = function(location, callback) {
    callback = callback || function() {};
    var error = null,
        message = null;

    var git = spawn('git', ['init'], {
        cwd: location
    });

    git.on('exit', function( code ){
        //wait a tick because
        //stderr will be written after exit
        process.nextTick(function(){
            callback( error, message, code );
        });
    });

    git.stdout.setEncoding('utf8');
    git.stdout.on('data', function(data) {
        message = data.replace(/\n/, '');
    });

    git.stderr.setEncoding('utf8');
    git.stderr.on('data', function( err ){
        error = err;
    });
};
