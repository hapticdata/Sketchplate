
var request = require('request'),
	wrench = require('wrench'),
	util = require('util'),
	events = require('events'),
	fs = require('fs'),
	path = require('path'),
	util = require('util'),
	spawn = require('child_process').spawn,
	instance;



exports.Fetch = Fetch;

var Fetch = function (){

};

util.inherits( Fetch, events.EventEmitter );


Fetch.prototype.prepareDirectory = function ( venDir ){
	//make the vendor directory if it doesnt exist
	if( !path.existsSync(venDir) ){
		console.log("making vendor folder");
		fs.mkdirSync(venDir);
	}
};

Fetch.prototype.updateLib = function ( javascriptDir, params, lib ) {
	var self = this;
	lib = lib.toLowerCase();
	//download the file and write it
	if( params.url ){
		request( params.url, function ( err, response, body ){
			if( err ) throw err;
			fs.writeFile( javascriptDir +'/'+ params.target, body, function ( err ){
				if( err ) throw err;
				self.emit('change', { target: params.target });
			});
		});
	} else if( params.git ){
		//The library is a git repo
		var clone = spawn('git', [ 'clone', params.git, lib ]);
		console.log( 'Retrieving git repo: '+params.git );
		clone.stdout.on('data', function ( data ) {
			//console.log(data );
		});

		clone.on('exit', function ( code ) {
			if( code === 0 ){
				wrench.copyDirRecursive(lib +'/'+ params.src, javascriptDir+'/'+ params.target, function ( err ) {
					if( err ) throw err;
					wrench.rmdirRecursive( lib, function ( err ) {
						if( err ) throw err;
						self.emit('change', { target: params.target });
					});
				});
			} else {
				console.log( 'Error retrieving git repo, exited with code: '+code);
			}
		});
	}
};

instance = new Fetch();


exports.libs = function ( javascriptDir, vendorDir, libs ){
	instance.prepareDirectory( vendorDir );
	for( var lib in libs ){
		instance.updateLib( javascriptDir, libs[lib], lib.toLowerCase());
	}
	return instance;
};