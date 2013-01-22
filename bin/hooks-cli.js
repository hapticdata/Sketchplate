
var hooks = require('../lib/sketchplate').hooks,
	config = require('../lib/config').getUserConfig();

/**
 * append the hooks-related help to this CLI menu
 * @param command
 * @return {Command}
 */
exports.appendHelp = function appendHooksHelp( command ){
	return command
        .option('-b, --browse', 'Open project in file browser', '')
        .option('-e, --editor', 'Launch project in editor '+ config.editor.red, '')
		.option('-g, --git-init', 'Initialize a git repository', '')
		.option('-n, --npm-install', 'Run npm install', '')
		.option('-s, --server [port]', 'Start a static file server with connect on [port]', undefined);
};

/**
 * create an array suitable for an async.waterfall
 * @example
 *      async.waterfall(hooks.createWaterfall(options), function(err,directory){});
 * @param options
 * @param waterfall
 * @type {Array} array of watefall functions
 */
exports.createWaterfall = function addHooks( options, waterfall ){
    var errors = {};
    var waterfall = waterfall || [];
	if( options.editor ){
		waterfall.push(function openInEditor( directory, next ){
			hooks.openInEditor( config.editors[ config.editor ], directory, function( err ){
                if( err ){
                    err = { id: 'editor', message: 'failed to launch editor, please check your config' };
                }
				next( err, directory );
			});
		});
	}
	if( options.gitInit ){
		waterfall.push(function( directory, next ){
			hooks.initRepo( directory, function( err ){
                if( err ){
                    err = { id: 'gitInit', message: 'failed to initialzie repo' };
                }
				next( err, directory);
			});
		});
	}
	if( options.npmInstall ){
		waterfall.push(function( directory, next ){
			hooks.npmInstall( directory, function( err ){
                if( err ){
                    err = { id: 'npmInstall', message: 'failed to complete `npm install`'};
                }
				next( err, directory);
			});
		});
	}
	if( options.browse ){
		waterfall.push(function( directory, next ){
			hooks.openInFileBrowser( directory, function( err ){
                if( err ){
                    err = { id: 'browse', message: 'failed to open file browser' };
                }
				next( err, directory );
			});
		});
	}
	if( options.server ){
		var port = options.server;
		if( port === true ){
			port = 3000;
		}
		waterfall.push(function( directory, next ){
            try {
                hooks.initServer( directory, { port: port } );
                console.log('Serving '.red+directory+' at:'.red+' http://0.0.0.0:'+port);
            } catch( e ){
                next( {id: 'server', message: 'server failed, port '+ port + ' likely arleady taken'});
            }
			next( null, directory );
		});
	}
    return waterfall;
};