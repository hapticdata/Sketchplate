var targetMap = require('../lib/fetch/createOperationCollection'),
    _ = require('underscore'),
    assert = require('assert');


var origin = './',
    resource;


resource = {
    target: {
        'lib/': '',
        '*.json': ''
    }
};

describe('fetch/createOperationCollection', function(){

    describe('module function', function(){
        it('should return a map of operations', function( done ){
            targetMap(origin, resource, function( err, map){
                var directories = _.filter( map, function(m){ return m.isDirectory; }),
                    files = _.difference( map, directories );
                assert.ok( directories.length > 0 );
                assert.ok( files.length > 0 );
                done();
            });
        });
    });

    describe('getRelativeSources( originDirectory, sources, callback )', function(){
        it('should return sources', function(done){
            targetMap.getRelativeSources( origin, _.keys(resource), function( err, sourceMap ){
                assert.equal( err, null );
                assert.ok( typeof sourceMap === 'object' );
                done();
            });
        });
    });
});
