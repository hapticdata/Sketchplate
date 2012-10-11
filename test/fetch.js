var fetch = require('../lib/fetch');


describe('fetch', function(){
/*
	it('should download async.js from a url', function( done ){
		fetch({
				"url": "https://raw.github.com/caolan/async/master/lib/async.js",
				"target": "javascripts/vendor/async.js"
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
				"target": "javascripts/vendor/dat"
			})
			.on('exit', function( err ){
				if( err ) throw err;
				done();
			});
	});

	it('should clone toxiclibsjs with git and nest it', function( done ){
		this.timeout( 120000 );
		fetch({
				"git": "https://github.com/hapticdata/toxiclibsjs.git",
				"src": "lib/toxi",
				"target": "javascripts/really/deep/directory/toxi"
			})
			.on('exit', function( err ){
				if( err ) throw err;
				done();
			});
	});*/

	it('should download tarball', function( done ){
		this.timeout( 120000 );
		fetch({
			"zip": "https://github.com/hapticdata/adm-zip/zipball/master",
			"target": "javascripts/tar-async"
		})
		.on('exit', function( err ){
			if( err ) throw err;
			done();
		});
	});
});