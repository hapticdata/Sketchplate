var spawn = require('win-spawn'),
    os = require('os');

//commands for different operating systems
var commands = {
    'darwin': 'open',
    'win32': 'explorer',
    'linux': 'nautilus'
};

/**
 * Open the `location` in the OS file-browser (i.e. Finder on Mac)
 * @param {String} location the file path of the folder.
 * @param {Object} [options]
 * @param {Array} [options.args] arguments to send to the native command
 * @param {Function} callback( error, code ) the callback for when complete
 * @returns {ChildProcess} the spawned process
 */
module.exports = function( location, options, callback ){
    if( arguments.length === 2 && typeof arguments[1] === 'function' ){
        callback = options;
        options = {};
    }
    options = options || {};
    options.args = options.args || [];
    callback = callback || function(){};
	var cmd = exports.command();
	return spawn( cmd, [location].concat(options.args) ).on('exit', function( code ) {
		var err;
		if( code !== 0 ){
			err = new Error('Error opening folder in file browser, exited with code '+ code );
		}
        callback( err, code );
	});
};

/**
 * what is the command to use for this OS?
 * @returns {String} the command
 */
exports.command = function(){
    return commands[ os.platform() ];
};

