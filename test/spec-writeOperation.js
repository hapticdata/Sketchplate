var targetMap = require('../../lib/fetch/createOperationCollection'),
    writeOperation = require('../../lib/fetch/writeOperation'),
    assert = require('assert'),
    tmp = 'test_target_map/';



var origin = './',
    resource;

resource = {
    target: {
        'lib/': tmp,
        '*.json': tmp
    }
};


describe('fetch/writeOperation', function(){
    it('should perform all write operations', function( done ){
        this.timeout(0);
        targetMap( origin, resource, function( err, map ){
            writeOperation( map, function( err ){
                assert.equal( err, null );
                done();
            });
        });
    });
});
