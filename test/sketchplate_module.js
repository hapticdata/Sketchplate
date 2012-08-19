/*global describe, it*/
var sketchplate = require('../lib/sketchplate');

describe('Creates a new default project', function (){

	var projectLocation = '../test-project';
	var project = sketchplate.create( projectLocation, require('../settings.json') );

	it('should create a new project', function ( done ){
		this.timeout( 120000 );
		project.copyTemplate(function (err, location ){
			if( err ){
				console.log('error');
				throw err;
			}
			done();
		});
	});

	it('should create a git repository', function (done ){
		project.initRepo(function ( code ){
			if( code !== 0 )
				throw new Error("Git repo initialization failed with code: "+ code );
			done();
		});
	});

	it('should open sublime text', function ( done ){
		project.openInEditor(function (err ){
			if( err )
				throw err;
			done();
		});
	});
});
