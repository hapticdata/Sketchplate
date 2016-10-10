/*global describe, it, after*/
var sketchplate = require('../lib/sketchplate'),
    fs = require('fs-extra'),
    _ = require('underscore'),
    config = require('../lib/config'),
    assert = require('assert');

describe('Creates a new default project', function (){

	var projectLocation = './test_plate';
	var plate = sketchplate.create(_.defaults({ template: 'amd-sketch' }, config.getUserConfig()));

    after(function(){
        fs.removeSync(projectLocation);
    });

    describe('sketchplate.create', function(){
        it('should be a plate for `amd-sketch` template', function(){
            assert.equal( typeof plate.copyTemplate, 'function' );
            assert.equal( typeof plate.templatePath, 'string' );
        });
    });

    describe('plate#fetchAll', function(){
        it('should download all fetch-resources', function( done ){
            this.timeout( 180000 );
            var onComplete = function(){
                done();
            };
            var onProgress = function(err, msg){
                assert.equal( err, null );
                assert.equal( typeof msg.id, 'string' );
            };
            plate.fetchAll( onComplete, onProgress );
        });
    });

    describe('plate#copyTemplate', function(){
        it('should create a new project', function ( done ){
            this.timeout( 180000 );
            //copy template
            plate.copyTemplate( projectLocation, function (err, project ){
                if( err ) throw err;
                //take created project and init repo
                project.gitInit(function ( err, actionsPerformed ){
                    assert.equal( err, null );
                    assert.ok( actionsPerformed.length > 0 );
                    done();
                });
            });
        });
    });
});
