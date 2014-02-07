var targetMap = require('../../lib/fetch/createOperationCollection'),
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
            var directories = _.filter( map, function(m){ return m.isDirectory; }),
                files = _.difference( map, directories );

            done();
        });
    });

    it('should writeOperation', function( done ){
       var writeOp = require('../../lib/fetch/writeOperation');

        targetMap( origin, resource, function( err, map ){
            async.map( map, writeOp, function( er ){
                console.log('')
            })
           writeOp( map, function(){});
        });

    });

});
