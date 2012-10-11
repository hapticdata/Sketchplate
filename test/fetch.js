/*global describe, it*/
var fetch = require('../lib/fetch');


describe('fetch', function(){
	var tmp = 'test_downloads/';
	it('should download async.js from a url', function( done ){
		fetch({
				"url": "https://raw.github.com/caolan/async/master/lib/async.js",
				"target": tmp + "vendor/async.js"
			})
			.on('exit',function( err ){
				if( err ) throw err;
				done();
			});
	});

	it('should clone dat-gui with git', function( done ){
		this.timeout( 120000 );
		fetch({
				"git": "https://code.google.com/p/dat-gui/",
				"src": "src/dat",
				"target": tmp + "vendor/dat"
			})
			.on('exit', function( err ){
				if( err ) throw err;
				done();
			});
	});

	it('should download bootstrap as a zipball', function( done ){
		this.timeout( 120000 );
		fetch({
			"zip": "https://github.com/twitter/bootstrap/zipball/master",
			"target": tmp + "bootstrap/"
		})
		.on('exit', function( err ){
			if( err ) throw err;
			done();
		});
	});
});