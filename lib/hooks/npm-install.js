var spawn = require('child_process').spawn;

/**
 * run `npm install` in the provided location
 * @param {String} location the path to run the command within.
 * @param {Object} [options]
 * @param {Array} [options.args] arguments to send to npm install, i.e. ['--production']
 * @param {Function} callback( error, code )
 * @returns {ChildProcess} the spawned process
 */
module.exports = function( location, options, callback ){
    if( arguments.length === 2 && typeof arguments[1] === 'function' ){
        callback = options;
        options = options || {};
    }
    options = options || {};
    options.args = options.args || [];
    callback = callback || function(){};
    var error = null;

	var npm = spawn( 'npm', ['install'].concat(options.args), {
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
