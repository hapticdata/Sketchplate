
var hooks = require('../lib/sketchplate').hooks,
	config = require('../lib/config').getUserConfig();

exports.appendHelp = function appendHooksHelp( command ){
	return command
		.option('-g, --git-init', 'Initialize repo after creation', '')
		.option('-n, --npm-install', 'Run npm install on the new project', '')
		.option('-c, --connect-server [port]', 'Start a static file server with connect on [port]', undefined)
		.option('-s, --skip-editor', 'Skip opening project in editor', '')
		.option('-b, --browse', 'Open project in file browser', '');
};

exports.addToWaterfall = function addHooks( options, waterfall ){
	if( !options.skipEditor ){
		waterfall.push(function openInEditor( directory, next ){
			hooks.openInEditor( config.editors[ config.editor ], directory, function( err ){
				next( err, directory );
			});
		});
	}
	if( options.gitInit ){
		waterfall.push(function( directory, next ){
			hooks.initRepo( directory, function( err ){
				next( err, directory);
			});
		});
	}
	if( options.npmInstall ){
		waterfall.push(function( directory, next ){
			hooks.npmInstall( directory, function( err ){
				next( err, directory);
			});
		});
	}
	if( options.browse ){
		waterfall.push(function( directory, next ){
			hooks.openInFileBrowser( directory, function( err ){
				next( err, directory );
			});
		});
	}
	if( options.connectServer ){
		var port = options.connectServer;
		if( port === true ){
			port = 3000;
		}
		waterfall.push(function( directory, next ){
			hooks.initServer( directory, { port: port } );
			console.log('Serving '.red+directory+' at:'.red+' http://0.0.0.0:'+port);
			next( null, directory );
		});
	}
};