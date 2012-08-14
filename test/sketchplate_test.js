
var assert = require('assert'),
	sketchplate = require('../lib/sketchplate');



describe('Creates a new project', function (){
	var newProject = '../test-project';
	it('should create a new project', function ( done ){
		this.timeout( 120000 );
		sketchplate.create(newProject, function (err, location ){
			if( err )
				throw err;
			console.log('location: '+location);
			done();
		});
	});

	it('should create a git repository', function (done ){
		sketchplate.initRepo( newProject, function ( code ){
			if( code !== 0 )
				throw new Error("Git repo initialization failed with code: "+ code );
			done();
		});
	});

	it('should open sublime text', function ( done ){
		sketchplate.openInEditor(newProject, function (err ){
			if( err )
				throw err;
			done();
		});
	});
});
