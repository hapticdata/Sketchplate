/*global describe, it*/
var fetch = require('../lib/fetch');


describe('fetch', function(){
	var tmp = 'test_downloads/';
	it('should download async.js from a url', function( done ){
		fetch({
				"url": "https://raw.github.com/caolan/async/master/lib/async.js",
				"target": tmp + "vendor/async.js"
			},function( err ){
				if( err ) throw err;
				done();
			});
	});

	it('should clone dat-gui with git', function( done ){
		this.timeout( 120000 );
		fetch({
				"clone": "https://code.google.com/p/dat-gui/",
				"target": {
					"src/dat": tmp + "vendor/dat",
					"build": tmp + "build"
				}
			}, function( err ){
				if( err ) throw err;
				done();
			});
	});

	it('should download bootstrap as a zipball', function( done ){
		this.timeout( 120000 );
		fetch({
			"zip": "https://github.com/twitter/bootstrap/zipball/master",
			"target": {
				"js/": tmp + "javascripts/vendor/bootstrap/",
				"less/": tmp + "less/bootstrap/"
			}
		}, function( err ){
			if( err ) throw err;
			done();
		});
	});

	it('should report that an invalid resource was provided', function( done ){
		fetch({ "test": "" }, function( err ){
			if( err ){
				done();
			} else {
				throw Error("Fetch failed to throw an error with an invalid resource");
			}
		});
	});
});