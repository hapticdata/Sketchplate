/*global describe, before, after, it*/
var targetMap = require('../lib/fetch/createOperationCollection'),
    writeOperation = require('../lib/fetch/writeOperation'),
    assert = require('assert'),
    fs = require('fs-extra'),
    path = require('path'),
    tmp = path.resolve('test_fetch-writeOperation');


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
        fs.removeSync(tmp);
    });


    it('should perform all write operations', function( done ){
        this.timeout(10000);
        targetMap( origin, resource, function( err, map ){
            assert.equal( err, null );
            assert.ok(map.length > 20);
            assert.ok(map[0].destination.indexOf(path.sep) >= 0);
            writeOperation( map, function( err, destinations ){
                assert.equal( err, null );
                assert.ok( Array.isArray(destinations) );
                assert.ok( destinations.length > 1 );
                done();
            });
        });
    });
});
