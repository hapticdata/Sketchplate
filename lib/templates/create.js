var fs = require('fs'),
    mkdirp = require('mkdirp');

/**
 * @private
 * make a default `template.json` file for this new template.
 * @param {object} opts an object with a `name` and `description`.
 * @returns {string} the template.json body.
 */
var makeJSON = function( opts ){
	return [
		'{',
		'\t"name": "'+opts.name+'",',
		'\t"version": "0.0.0",',
		'\t"author": "",',
		'\t"description": "'+opts.description+'",',
		'\t"fetch": {}',
		'}'
	].join('\n');
};

//creates a new blank template
module.exports = function createTemplate( settings, opts, fn ){
    var tmpJSON = makeJSON( opts );
	var tmplDir = settings.templatesPath +'/'+ opts.name;
	mkdirp( settings.templatesPath + '/' + opts.name + '/template', function( err ){
		if( err ){
			fn( err );
			return;
		}
		fs.writeFile( tmplDir + '/template.json', tmpJSON, function( err ){
			fn( null, tmplDir );
		});
	});
};
