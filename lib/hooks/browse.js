var spawn = require('child_process').spawn,
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
 * @param {Function} callback( error, code ) the callback for when complete
 * @returns {ChildProcess} the spawned process
 */
module.exports = function( location, callback ){
    callback = callback || function(){};
	var cmd = commands[ os.platform() ];
	return spawn( cmd, [location] ).on('exit', function( code ) {
		var err;
		if( code !== 0 ){
			err = new Error('Error opening folder in file browser, exited with code '.red+ code );
		}
        callback( err, code );
	});
};

