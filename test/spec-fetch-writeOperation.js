/*global describe, before, after, it*/
var targetMap = require('../lib/fetch/createOperationCollection'),
    writeOperation = require('../lib/fetch/writeOperation'),
    assert = require('assert'),
    fs = require('fs'),
    wrench = require('wrench'),
    tmp = 'test_fetch-writeOperation/';


var origin = './',
    resource;

resource = {
    target: {
        'lib/': tmp,
        '*.json': tmp
    }
};


describe('fetch/writeOperation', function(){
    before(function(){
        fs.mkdirSync(tmp);
    });

    after(function(){
        wrench.rmdirSyncRecursive(tmp);
    });


    it('should perform all write operations', function( done ){
        this.timeout(10000);
        targetMap( origin, resource, function( err, map ){
            assert.equal( err, null );
            writeOperation( map, function( err, destinations ){
                assert.equal( err, null );
                assert.ok( Array.isArray(destinations) );
                assert.ok( destinations.length > 1 );
                done();
            });
        });
    });
});
