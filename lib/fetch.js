//#Fetch
//Fetch can be used to automate the downloading of resources into your project
//it accepts the following types of operations:
//
//1.	**file** - download a file and copy it to the target
//1.	**clone** - clone a git repository and copy all or parts of its
//contents to specified targets
//1.	**zip** - download a zip file, extract it and copy all or parts of its
//contents to specified targets
//
//**_Basic use:_**
//
//_single fetch:_
//
//		fetch({
//			file: "http://code.jquery.com/jquery.js",
//			target: "javascripts/vendor/jquery.js"
//		}, function callback( errors ){
//			//if any errors it will be an array
//		});
//_batch fetch:_
//
//		fetch([
//			file: "http://code.jquery.com/jquery.js",
//			target: "jquery.js"
//		},{
//			"clone": "https://code.google.com/p/dat-gui/",
//			"target": {
//				"src/dat": "dat/",
//				"build": "datgui/build"
//			}
//		},{
//			"zip": "https://github.com/twitter/bootstrap/zipball/master",
//			"target": {
//				"js/": "bootstap/js",
//				"less/": "bootstrap/less"
//			}
//		}], function callback( errors ){
//			//if any errors it will be an array
//		});

var request = require('request'),
	AdmZip = require('adm-zip'),
	async = require('async'),
    _ = require('underscore'),
	fs = require('fs-extra'),
    path = require('path'),
	os = require('os'),
	spawn = require('child_process').spawn,
    createOperationCollection = require('./fetch/createOperationCollection'),
    writeOperations = require('./fetch/writeOperation'),
    fromFile = require('./fetch/fromFile');




//###fetch() module
function fetch( resource, options, callback ){
	if( arguments.length === 2 && typeof arguments[1] === 'function' ){
		callback = options;
		options = {};
	}

	if( Array.isArray(resource) ){
		//create an obj of fetch requests for individual resources,
		//so we can load them in parallel
		var fetches = resource.map(function( res ){
			return function( next ){
				fetch( res, next);
			};
		});
		async.parallel( fetches, callback );
	} else {
		//if its a single resource, fetch it
		if( resource.file ) fromFile( resource, options, exit);
		else if( resource.clone ) fromGit( resource, options, exit );
		else if( resource.zip ) fromZip( resource, options, exit );
		else {
			exit(Error("Invalid resource, did not find method of retrieval in object"));
		}
	}
	function exit( err ){
		callback( err, resource );
	}
}

//function getTmp(){ return path.join(path.resolve('~/.sketchplate'),'sketchplate-tmp') + '/'; }
function getTmp(){ return path.join(os.tmpdir(),'sketchplate') + '/'; }
function getFilename( src ){ return src.substr(src.lastIndexOf('/')+1, src.length); }

//process the targets supplied
function processTargets( contentsFolder, resource, callback ){
    createOperationCollection( contentsFolder, resource, function( err, operations ){
        //operations: [ { source:String, destination:String, isDirectory:Boolean } ]
        writeOperations( operations, callback );
    });
}


//The resource is a git repo
var reposCloned = Date.now();
//retrieve a git repository and process its contents for targets
//
//-	{Object} [resource]
//-	{String} [resource.clone] the repository address to clone
//- {String || Object} [resource.target] if string entire contents will be copied
// otherwise should be an object of "source":"target" relationships
//-	{Function} [callback] receive callback when completed
function fromGit( resource, options, callback ){
	reposCloned++;
	//if options specified a tmpDir, use that instead
	var tmpStorage = path.resolve((options.tmpDir ? options.tmpDir : getTmp() ) + 'repo'+reposCloned);
	var repoSourceFolder = path.resolve(tmpStorage +'/');

	var clean = function( next ) {
        fs.remove(tmpStorage, next);
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
            fs.ensureDir(tmpStorage, function(err){
                next(err);
            });
		},
		function cloneRepo( next ){
			var clone = spawn('git', [ 'clone', resource.clone, tmpStorage ]);
			clone.stdout.on('data', function ( /*data*/ ) {});
			clone.on('exit', function( code ){
				if( code === 0 ){
					next();
				} else {
					next( new Error("Error fetching git repo: "+resource.clone+", exited with code: "+code) );
				}
			});
		},
        function checkoutTagOrBranch( next ){
            var params = ['checkout'];
            //if tag was provided, check it out, otherwise put the branch in
            //if neither, then undefined will be pushed, and the fn will
            //be exited
            params.push( resource.tag ? 'tags/'+resource.tag : resource.branch );
            //if neither, skip this step and proceed with master
            if( !resource.tag && !resource.branch ){
                next();
                return;
            }
            spawn('git', params, { cwd: tmpStorage })
            .on('exit', function( code ){
                next( code === 0 ? null : new Error("Error".red+" checking out tag "+resource.tag+" are you sure that exists?") );
            });
        },
        function rmGitFolder( next ){
            var gitRefFolder = path.join(repoSourceFolder, '.git');
            fs.remove(gitRefFolder, function(err){
                if( err ){
                    console.log('Failed to remove .git folder, continuing forward'.yellow);
                }
                next();
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


function fromZip( resource, options, callback ){
	var uid = new Date().getTime();
	var dZipStream,
		tmpDir = options.tmpDir ? options.tmpDir : getTmp(),
		fileLocation = tmpDir + uid +".zip",
		tmp = tmpDir + uid + '/';


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
				callback( new Error("Error fetching zip: "+resource.zip) );
			} else {
				callback( new Error("Error with fetched zip archive: "+ resource.zip) );
			}
		} else {
			callback( null );
		}
	});
}

module.exports = fetch;
