var sketchplate = require('..'),
    assert = require('assert'),
    wrench = require('wrench'),
    fs = require('fs'),
    tmp = 'test_hooks/';


describe('sketchplate.hooks.initRepo( location, callback ):ChildProcess', function(){
    var clean = function(){
        wrench.rmdirSyncRecursive(tmp);
    };

    before(function(){
        try {
            clean();
        } catch (e) {
        }
        fs.mkdirSync(tmp);
    });
    after(clean);

    it('should initialize a git repository', function( done ){
        sketchplate.hooks.initRepo( tmp, function( err, message, code ){
            assert.equal( err, null );
            assert.ok( message.indexOf('Initialized empty') >= 0 );
            assert.equal( code, 0 );
            done();
        });
    });
    it('should fail to initialize in an invalid directory', function( done ){
        sketchplate.hooks.initRepo('/does/not/exist/', function( err, message, code ){
            assert.notEqual( err, null );
            assert.equal( code, 127 );
            done();
        });
    });
});

