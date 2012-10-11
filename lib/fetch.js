
var request = require('request'),
	wrench = require('wrench'),
	AdmZip = require('adm-zip'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	events = require('events'),
	fs = require('fs'),
	os = require('os'),
	spawn = require('child_process').spawn;



function getTmp(){ return os.tmpDir() + 'sketchplate/'; }
function getPath( src ){ return src.substr(0, src.lastIndexOf('/')); }
function getFilename( src ){ return src.substr(src.lastIndexOf('/')+1, src.length); }

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
			var targetPath = getPath( resource.target );
			if( fs.existsSync(targetPath) ){
				next( null, body );
			} else {
				mkdirp( targetPath, function( err ){
					if( err ) throw err;
					next( null, body );
				});
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
	var tmpStorage = getTmp() + 'repo'+reposCloned;
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
		function cloneRepo( next ){
			var clone = spawn('git', [ 'clone', resource.git, tmpStorage ]);
			clone.stdout.on('data', function ( /*data*/ ) {});
			clone.on('exit', function( code ){
				if( code === 0 ){
					next();
				} else {
					next( Error("Error retrieving git repo, exited with code: "+code) );
				}
			});
		},
		function copy( next ){
			var dir = getPath( resource.target );
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
	var uid = new Date().getTime();
	var dZipStream,
		fileLocation = getTmp() + uid +".zip",
		tmp = getTmp() + uid + '/';
	

	async.waterfall([
		function createWrite( next ){
			dZipStream = fs.createWriteStream(fileLocation).on('close', function(){
				next(null, new AdmZip(fileLocation) );
			});
			//pipe it over
			request(resource.zip, function( /*err, response, body*/ ){}).pipe( dZipStream );
		},
		function inspectEntries( zip, next ){
			var uniqueFolders = [];
			var nestedInFolder = true;
			var entries = zip.getEntries();
			//how many root-folders are there?
			entries.forEach(function( entry ){
				//if its a directory and not already in the array
				if( entry.isDirectory && uniqueFolders.indexOf( entry.entryName ) < 0 ){
					//make sure it isnt a folder inside a folder
					var isInnerFolder = false;
					uniqueFolders.forEach(function( folder ){
						if( entry.entryName.indexOf( folder ) >= 0 ){
							//its inside a folder we already know about
							isInnerFolder = true;
						}
					});
					//if this is a new top-level folder, add it
					if( !isInnerFolder ){
						uniqueFolders.push( entry.entryName );
					}
				}
			});
			if( uniqueFolders.length === 1 ){
				//if theres only one folder, and everything is in it we need to know
				entries.forEach(function( entry ){
					if( entry.entryName.indexOf( uniqueFolders[0] ) < 0 ) {
						nestedInFolder = false;
					}
				});
			} else {
				nestedInFolder = false;
			}
			zip.extractAllTo( tmp );
			next( null, nestedInFolder ? tmp + uniqueFolders[0] : tmp );
		},
		function copyExtractedSource( source, next ){
			console.log('copyExtractedSource: ', source );
			var dir = getPath( resource.target );
			console.log('making dir: ', dir );
			mkdirp( dir, function( err ){
				if( err ) next( err );
				else {
					wrench.copyDirRecursive(source, resource.target, function( err ){
						next( err );
					});
				}
			});
		}
	], callback);
}

module.exports = function( resource ){
	resource.target = process.cwd() + '/' + resource.target;
	var emitter = new events.EventEmitter();
	function exit( err ){
		emitter.emit('exit',err, resource );
	}

	if( resource.url ) fromUrl( resource, exit);
	else if( resource.git ) fromGit( resource, exit );
	else if( resource.zip ) fromZip( resource, exit );

	return emitter;
};