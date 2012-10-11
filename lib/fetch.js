
var request = require('request'),
	wrench = require('wrench'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	util = require('util'),
	events = require('events'),
	fs = require('fs'),
	os = require('os'),
	util = require('util'),
	spawn = require('child_process').spawn,
	instance;


function extractDirectory( src ){ return src.substr(0, src.lastIndexOf('/')); }
function extractFilename( src ){ return src.substr(src.lastIndexOf('/')+1, src.length); }

function fromUrl( resource, callback ){
	async.waterfall([
		function( next ){
			if( resource.url ){
				request( resource.url, function( err, response, body ){
					if ( err ) next( err );
					else next( null, body );
				});
			}
		},
		function( body, next ){
			var targetPath = extractDirectory( resource.target );
			if( fs.existsSync(targetPath) ){
				next( null, body );
			} else {
				mkdirp( targetPath, function( err ){
					if( err ) throw err;
					next( null, body );
				})
			}
		},
		function( body, next ){
			fs.writeFile( resource.target, body, function( err ){
				if( err ) next( err );
				next( null, resource );
			});
		}
	], callback);
}

//The resource is a git repo
var reposCloned = 0;
function fromGit( resource, callback ){
	reposCloned++;
	var tmpStorage = os.tmpDir() + 'sketchplate/repo'+reposCloned;
	var repoSourceFolder = tmpStorage +'/'+ resource.src;

	var clean = function( next ) {
		wrench.rmdirRecursive( tmpStorage, function( err ){
			next( err );
		});
	};

	async.waterfall([
		function prepare( next ){
			if( fs.existsSync( tmpStorage ) ){
				clean( next );
			} else {
				next( null );
			}
		},
		function mk( next ){
			mkdirp( tmpStorage, function(err){
				next( err );
			});
		},
		function clone( next ){
			var clone = spawn('git', [ 'clone', resource.git, tmpStorage ]);
			clone.stdout.on('data', function ( data ) {
			});
			clone.on('exit', function( code ){
				if( code === 0 ){
					next();
				} else {
					next( Error("Error retrieving git repo, exited with code: "+code) );
				}
			});
		},
		function copy( next ){
			var dir = extractDirectory( resource.target );
			mkdirp( dir, function( err ){
				if( err ) next( err );
				else {
					wrench.copyDirRecursive(repoSourceFolder, resource.target, function( err ){
						next( err );
					});
				}
			});
		}
	], function( err ){
		clean(function(){
			callback( err );
		});
	});
}


function fromZip( resource, callback ){
	var AdmZip = require('adm-zip');
	var file = fs.createWriteStream('./test.zip');
	file.on('close', function(){
		var zip = new AdmZip('./test.zip');
		zip.getEntries().forEach(function( entry ){
			console.log('entry: ', entry.toString());
		})
		//zip.extractAllTo( './');
		callback(null);
	});

	request(resource.zip, function( err, response, body ){
	}).pipe( file );
}

function fromTarball( resource, callback ){
/*
http.get(options, function(res) {
    res.on('data', function(data) {
            file.write(data);
        }).on('end', function() {
            file.end();
            console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
        });
    });
};
*/
	/*async.waterfall([
		function( next ){
			var Untar = require('tar-async').Untar;
			var untar = new Untar(function (err, header, fileStream) {
				if( err ) throw err;
				console.log(header.filename);
				fileStream
					.on('data', function (data) {
						console.log(data.toString());
					});
				next( null, readStream );
			});
			request( resource.tar ).pipe( untar );
		},
		function( readStream ){
			var targetDirectory = extractDirectory( resource.target );
			var writeStream = fs.createWriteStream( targetDirectory );

			writeStream
				.on('end', next )
				.on('error', next );

			readStream.pipe( writeStream );
		}
	], callback);*/
/*
	async.waterfall([
		function ( next ){
			request( resource.tar, function( err, response, body ){
				if( err ) throw err;
				fs.writeFile( )
			}
		}
	]);*/
	/*else if( resource.tar ){
		request( resource.tar, function ( err, response, body ){
			if( err ) throw err;
			fs.writeFile( libName, body, function( err ){
				var untar = spawn('tar', ['-xzf', libName]);
				untar.on('exit', function( code ){
					//file is now untarred
					resource.sources.forEach(function( source, i ){
						wrench.copyDirRecursive( source.src, source.target, function( err ){
							if( err ) throw err;
							if( i === resource.sources.length) self.emit('exit', null, resource);
						});
					});
				});
			});
		})
	}*/
}

module.exports = function( resource ){
	resource.target = process.cwd() + '/' + resource.target;
	var emitter = new events.EventEmitter();
	function exit( err ){
		emitter.emit('exit',err, resource );
	}

	if( resource.url ) fromUrl( resource, exit);
	else if( resource.git ) fromGit( resource, exit );
	else if( resource.tar ) fromTarball( resource, exit );
	else if( resource.zip ) fromZip( resource, exit );

	return emitter;
};