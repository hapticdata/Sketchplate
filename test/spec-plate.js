/*global describe, it*/
var sketchplate = require('../lib/sketchplate'),
    _ = require('underscore'),
    config = require('../lib/config');

describe('Creates a new default project', function (){

	var projectLocation = '../test-project';
	var plate = sketchplate.create(_.defaults({ template: 'amd-sketch' }, config.getUserConfig()));

    describe.only('plate#fetchAll', function(){
        it('should download all fetch-resources', function( done ){
            this.timeout( 120000 );
            var i = 0;
            plate.fetchAll(done);
        });
    });

    describe('plate#copyTemplate', function(){
        it('should create a new project', function ( done ){
            this.timeout( 120000 );
            //copy template
            plate.copyTemplate( projectLocation, function (err, project ){
                if( err ) throw err;
                //take created project and init repo
                project.initRepo(function ( code ){
                    if( code !== 0 )
                        throw new Error("Git repo initialization failed with code: "+ code );
                });
                //take created project and open in editor
                project.openInEditor(function (err ){
                    if( err )
                        throw err;
                    done();
                });
            });
        });
    });
});
