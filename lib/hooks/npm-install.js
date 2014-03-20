var spawn = require('child_process').spawn;

/**
 * run `npm install` in the provided location
 * @param {String} location the path to run the command within.
 * @param {Function} callback( error, code )
 * @returns {ChildProcess} the spawned process
 */
module.exports =  function( location, callback ){
    callback = callback || function(){};
    var error = null;

	var npm = spawn( 'npm', ['install'], {
        cwd: location,
        stdio: 'inherit'
    });

    npm.on('exit', function( code ){
        process.nextTick(function(){
            callback( error, code );
        });
    });

    return npm;
};
