var targetMap = require('../../lib/fetch/createTargetMap'),
    path = require('path'),
    _ = require('underscore'),
    assert = require('assert');


describe.only('getRelativeSources( originDirectory, sources, callback )', function(){
    var origin = './',
        resource = {
            target: {
                'lib/': 'test/',
                '*.json': 'test/'
            }
        };
    it.skip('should return sources', function(done){
        targetMap.getRelativeSources( origin, _.keys(resource), function( err, sourceMap ){
            assert.equal( err, null );

            assert.ok( typeof sourceMap === 'object' );
        });
    });

    it('should return a map of operations', function( done ){
        targetMap(origin, resource, function( err, map){
            console.log( map );
            done();
        });
    });
});
