require('colors');

var program = require('commander'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	sketchplate = require('../lib/sketchplate'),
	hooks = require('../lib/hooks'),
	hooksCli = require('./hooks-cli'),
	config = require('../lib/config').getUserConfig();


hooksCli.appendHelp( program );


program.on('--help',function(){
	var l = console.log;

	l();
	l('  ex:'.cyan+' sketchplate hooks -ebg -s 8080');
	l('  run any combination of the options above on current or specified directory'.cyan);
	l();
});

program.parse( process.argv );
var waterfall = [
	function( next ){
		var pth = path.resolve( program.args.length === 1 ? program.args[0] : './');
		next( null, pth );
	}
];
hooksCli.createWaterfall( program, waterfall );
async.waterfall( waterfall, function( err ){
	if( err ){
		throw err.message;
	}
});
