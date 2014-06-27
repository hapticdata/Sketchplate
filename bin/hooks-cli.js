
var hooks = require('../lib/sketchplate').hooks,
	config = require('../lib/config').getUserConfig(),
    _ = require('underscore');

/**
 * append the hooks-related help to this CLI menu
 * @param command
 * @return {Command}
 */
exports.appendHelp = function appendHooksHelp( command ){
	return command
        .option('-b, --browse', 'Open project in file browser', '')
        .option('-e, --editor', 'Launch project in editor '+ config.editor.cyan, '')
		.option('-g, --git-init [remote]', 'Initialize a git repository with template committed, optionally provide a remote URL', null)
		.option('-n, --npm-install', 'Run npm install', '')
		.option('-s, --server [port]', 'Start a static file server with connect on [port]', undefined)
        .option('-v, --verbose', 'Display details including server log');
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
    waterfall = waterfall || [];
	if( options.gitInit ){
        var gitConfig = config.gitInit;
        var gitInitOptions = _.extend(gitConfig, { remoteAdd: options.gitInit !== true, remoteURL: options.gitInit });
		waterfall.push(function( directory, next ){
            var onMessage = function( message ){
                if( options.verbose ){
                    console.log( message.underline );
                }
            };

            var onComplete = function( err, actionsPerformed ){
                if( err ){
                    err = { id: 'gitInit', message: err.red };
                } else {
                    console.log( 'Git performed: '.green + actionsPerformed.join(', ') );
                }
				next( err, directory);
			};

			hooks.gitInit( directory, gitInitOptions, onComplete, onMessage );
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
            hooks.initServer( directory, {
                port: port,
                incrementPortOnError: options.server === true, //if no port was specified keep trying to find an open one
                verbose: options.verbose
            }, function( err, app, port ){
                if( err ){
                    next( {id: 'server', message: 'server failed on port '.red + port +', with: ' + err.message });
                    return;
                }
                console.log('Serving '.cyan+directory+' at:'.cyan+' http://0.0.0.0:'+port);
                next( null, directory );
            });
		});
	}
	if( options.editor ){
		waterfall.push(function openInEditor( directory, next ){
            hooks.openInEditor( directory, config.editors[ config.editor ], function( err ){
                if( err ){
                    err = { id: 'editor', message: 'failed to launch editor, please check your config' };
                }
                next( err, directory );
            });
		});
	}
    return waterfall;
};

