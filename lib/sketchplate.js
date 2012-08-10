var wrench = require('wrench'),
	fs = require('fs'),
	settings = require('./settings.json');


var red   = '\033[31m',
	blue  = '\033[34m',
	reset = '\033[0m';

var tmplDir = __dirname + settings.templateDirectory,
	jsDir = tmplDir + settings.javascriptsDirectory,
	venDir = jsDir + settings.vendorDirectory,
	libraries = settings.libraries;



function hasLibraries (){
	try {
		fs.readdirSync( venDir );
	} catch ( e ){
		//Vendor library does not exist, download libraries
		return false;
	}
	return true;
}


function create ( location ){
	wrench.copyDirRecursive( tmplDir, location, function ( err ){
		if( err ){
			console.log( err );
		} else {
			console.log(red+'Project created at '+reset+location);
		}
	});
	return this;
}

function fetchLibs (fn){
	require('./fetch').libs( jsDir, venDir, libraries )
		.on('change', function ( e ){
			console.log( red+'[added] '+reset, e.target );
		});
	return this;
}

exports.create = create;
exports.fetchLibs = fetchLibs;
exports.hasLibraries = hasLibraries;