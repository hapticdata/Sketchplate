/*global describe,it*/
var assert = require('assert'),
    fs = require('fs'),
    sketchplate = require('../lib/sketchplate');


/**
 * TDD for the `git template install` command
 * examples:
 * $ sketchplate template install hapticdata/template-static-grunt
 * $ sketchplate template install hapticdata/template-static-grunt#v0.1.0
 * $ sketchplate template install git://github.com/hapticdata/template-static-grunt.git
 * $ sketchplate template install git://github.com/hapticdata/template-static-grunt.git#v0.1.0
 * $ sketchplate template install https://github.com/hapticdata/template-static-grunt/archive/master.zip
 * specify a folder:
 * $ sketchplate template install hapticdata/template-static-grunt static-grunt
 *
 * SHELVED
 * TDD for the `sketchplate template update static-grunt`
 * TODO this would require some sort of outside json file that tracks the history
 * of where templates came from. But some would still be created directly in the filesystem
 *
 */

var settings = { templatesPath: './test_downloads' },
    eS;


eS = function(tmp){
    return fs.existsSync( settings.templatesPath+'/'+tmp );
};


describe('sketchplate.installTemplate()', function(){

    var makeTest = function( str, rename ){
        return function( done ){
            this.timeout( 100000 );
            sketchplate.installTemplate(settings, str, rename, function( err, info ){
                if( err ){
                    console.log( err );
                }
                assert.ok( !err );
                assert.ok( typeof info === 'object' );
                done();
            });
        };
    };
    describe.only('<pkg>', function(){
        describe('from github <user>/<repo>', function(){
           it('should install from github', makeTest('hapticdata/template-static-grunt'));
        });
        describe('from git HTTPS url', function(){
            it('should install from git', makeTest('https://github.com/hapticdata/template-static-grunt.git','static-grunt'));
            it('should have created the folder "static-grunt"', function(){
                assert.ok( eS('static-grunt') );
            });

        });
        describe('from zip', function(){
            it('should install from zip', makeTest('http://github.com/h5bp/html5-boilerplate/archive/master.zip','html5bp'));
            it('should have created the folder "html5bp"', function(){
                assert.ok( eS('html5bp') );
            });
        });
    });

    describe('<pkg>#<version>', function(){
        describe('from github <user>/<repo>#<version>', function(){
            it('should install tagged version 0.1.0', makeTest('h5bp/html5-boilerplate#v4.2.0'));
        });
    });
});



