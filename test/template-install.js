/*global describe,it*/
var assert = require('assert');


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


describe('sketchplate.installTemplate()', function(){

    var makeTest = function( str ){
        return function( done ){
            sketchplate.installTemplate(str, function( err, info ){
                assert.ok( !err );
                assert.ok( typeof info === 'object' );
                done();
            });
        });
    };
    describe('<pkg>', function(){
        describe('from github <user>/<repo>', function(){
           it('should install from github', makeTest('hapticdata/template-static-grunt'));
        });
        describe('from git:// url', function(){
            it('should install from git://**', makeTest('git://github.com/hapticdata/template-static-grunt.git'));
        });
        describe('from zip', function(){
            it('should install from zip', makeTest('https://github.com/hapticdata/template-static-grunt/archive/master.zip'));
        });
    });

    describe('<pkg>#<version>', function(){
        describe('from github <user>/<repo>#<version>', function(){
            it('should install tagged version 0.1.0', makeTest('hapticdata/template-static-grunt#0.1.0'));
        });
    });
});



