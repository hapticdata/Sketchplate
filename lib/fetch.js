
var request = require('request'),
	wrench = require('wrench'),
	AdmZip = require('adm-zip'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	fs = require('fs'),
	os = require('os'),
	spawn = require('child_process').spawn;



function getTmp(){ return os.tmpDir() + 'sketchplate/'; }
function getTargetPath( src ){ return src.substr(0, src.lastIndexOf('/')); }
function getFilename( src ){ return src.substr(src.lastIndexOf('/')+1, src.length); }

//process the targets supplied
function processTargets( contentsFolder, resource, callback ){
	async.waterfall([
		function process( next ){
			var targets = [];
			//console.log('resource.target: '+ resource.target);
			//console.log( 'typeof: '+ (typeof resource.target ) );
			if( typeof resource.target === 'string' ){
				//copy entire thing
				targets.push({ source: '', destination: resource.target });
			} else {
				for( var prop in resource.target ){
					targets.push({ source: prop, destination: resource.target[prop] });
				}
			}
			//console.log(' targets: ', targets );
			next( null, targets );
		},
		function copy( targets, next ){
			async.whilst(
				function test(){ return targets.length > 0; },
				function copyTarget( whilstNext ){
					var target = targets.shift();
					var dir = getTargetPath( target.destination );
					mkdirp( dir, function( err ){
						if( err ){
							next( err );
						}
						else {
							wrench.copyDirRecursive( contentsFolder + target.source, target.destination, function( err ){
								whilstNext( err );
							});
						}
					});
				},
				next
			);
		}
	], callback );
}

//retrieve a resource from a text file
function fromUrl( resource, callback ){
	async.waterfall([
		function download( next ){
			if( resource.url ){
				request( resource.url, function( err, response, body ){
					if ( err ) next( err );
					else next( null, body );
				});
			}
		},
		function makepath( body, next ){
			var targetPath = getTargetPath( resource.target );
			if( fs.existsSync(targetPath) ){
				next( null, body );
			} else {
				mkdirp( targetPath, function( err ){
					if( err ) throw err;
					next( null, body );
				});
			}
		},
		function write( body, next ){
			fs.writeFile( resource.target, body, function( err ){
				if( err ) next( err );
				next( null, resource );
			});
		}
	], function( err ){
		if( err ){
			callback( Error("Error fetching url: "+resource.url) );
		}
	});
}

//The resource is a git repo
var reposCloned = 0;
//retrieve a git repository and process its contents for targets
//
//-	{Object} [resource]
//-	{String} [resource.clone] the repository address to clone
//- {String || Object} [resource.target] if string entire contents will be copied
// otherwise should be an object of "source":"target" relationships
//-	{Function} [callback] receive callback when completed
function fromGit( resource, callback ){
	reposCloned++;
	var tmpStorage = getTmp() + 'repo'+reposCloned;
	var repoSourceFolder = tmpStorage +'/';

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
			var clone = spawn('git', [ 'clone', resource.clone, tmpStorage ]);
			clone.stdout.on('data', function ( /*data*/ ) {});
			clone.on('exit', function( code ){
				if( code === 0 ){
					next();
				} else {
					next( Error("Error fetching git repo: "+resource.clone+", exited with code: "+code) );
				}
			});
		},
		function processRepo( next ){
			processTargets( repoSourceFolder, resource, next );
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
			request(resource.zip, function( err /*, response, body*/ ){
				if( err ){
					next( err );
				}
			}).pipe( dZipStream );
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
		function processExtracted( contentsFolder, next ){
			processTargets( contentsFolder, resource, next );
		}
	], function( err ){
		if( err ){
			if( err.message.indexOf('getaddrinfo ENOENT') > -1 ){
				callback( Error("Error fetching zip: "+resource.zip) );
			} else {
				callback( Error("Error with fetched zip archive: "+ resource.zip) );
			}
		} else {
			callback( null );
		}
	});
}

module.exports = function( resource, callback ){
	function exit( err ){
		callback( err, resource );
	}

	if( resource.url ) fromUrl( resource, exit);
	else if( resource.clone ) fromGit( resource, exit );
	else if( resource.zip ) fromZip( resource, exit );
	else {
		exit(Error("Invalid resource, did not find method of retrieval in object"));
	}
};