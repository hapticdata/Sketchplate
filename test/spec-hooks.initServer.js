var sketchplate = require('..'),
    assert = require('assert'),
    async = require('async');


describe('sketchplate.hooks.initServer()', function(){
    it('should connect successfully', function( done ){
        sketchplate.hooks.initServer('./', { port: 6000 }, function(err, app, port){
            assert.equal( err, null );
            assert.ok( typeof app === 'function' );
            assert.ok( typeof app.use === 'function' );
            assert.equal( port, 6000 );
            done();
        });
    });

    it('should start up 5 servers with { incrementPortOnError: true } and fail on the 6th', function(done){
        var options = {
            port: 4000,
            incrementPortOnError: true,
            maxAttempts: 5
        };
        async.times( options.maxAttempts, function( n, next ){
            sketchplate.hooks.initServer('./', options, next);
        }, function( err, results ){
            assert.equal( err, null );
            assert.equal( results.length, options.maxAttempts );

            sketchplate.hooks.initServer('./', options, function( err, app, port ){
                assert.notEqual( err, null );
                done();
            });
        });
    });
});