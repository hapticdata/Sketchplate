
var request = require('request'),
	wrench = require('wrench'),
	util = require('util'),
	events = require('events'),
	fs = require('fs'),
	path = require('path'),
	util = require('util'),
	spawn = require('child_process').spawn,
	instance;



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

Fetch.prototype.retrieveLib = function ( library ) {
	var self = this;
	var libName = library.id.toLowerCase();
	//download the file and write it
	if( library.url ){
		self.emit('get',null,library);
		request( library.url, function ( err, response, body ){
			if( err ) throw err;
			fs.writeFile( library.target, body, function ( err ){
				if( err ) throw err;
				self.emit('exit', null, library );
			});
		});
	} else if( library.git ){
		var repoSourceFolder = libName +'/'+ library.src;
		//The library is a git repo
		var clone = spawn('git', [ 'clone', library.git, libName ]);
		self.emit('get',null,library);
		clone.stdout.on('data', function ( data ) {
			//console.log(data );
		});

		clone.on('exit', function ( code ) {
			if( code === 0 ){
				wrench.copyDirRecursive(repoSourceFolder, library.target, function ( err ) {
					if( err ) throw err;
					wrench.rmdirRecursive( libName, function ( err ) {
						if( err ) throw err;
						self.emit('exit', null, library );
					});
				});
			} else {
				console.log( 'Error retrieving git repo, exited with code: '+code);
			}
		});
	} else if( library.tar ){
		request( library.tar, function ( err, response, body ){
			if( err ) throw err;
			fs.writeFile( libName, body, function( err ){
				var untar = spawn('tar', ['-xzf', libName]);
				untar.on('exit', function( code ){
					//file is now untarred
					library.sources.forEach(function( source, i ){
						wrench.copyDirRecursive( source.src, source.target, function( err ){
							if( err ) throw err;
							if( i === library.sources.length) self.emit('exit', null, library);
						});
					});
				});
			});
		})
	}
	return this;
};

instance = new Fetch();

exports.Fetch = Fetch;
exports.libs = function ( javascriptDir, libs ){
	for( var lib in libs ){
		instance.updateLib( javascriptDir, libs[lib], lib.toLowerCase());
	}
	return instance;
};