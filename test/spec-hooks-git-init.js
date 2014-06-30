/*global it, before, after, describe*/
var sketchplate = require('..'),
    assert = require('assert'),
    wrench = require('wrench'),
    fs = require('fs'),
    _ = require('underscore'),
    tmp = 'test_hooks/';


describe('sketchplate.hooks.gitInit( location, options, callback ):ChildProcess', function(){
    var clean = function(){
        wrench.rmdirSyncRecursive(tmp);
    };

    before(function(){
        try {
            clean();
        } catch (e) {
        }
        fs.mkdirSync(tmp);
        fs.writeFileSync(tmp+'a.json','{}');
        fs.writeFileSync(tmp+'b.json', '{}');
    });
    after(clean);

    var test = function( expected, done ){
        return function( err, actionsPerformed ){
            assert.equal( err, null );
            //should have performed the expected actions
            assert.equal( actionsPerformed.length, expected.length );
            //contains all of them and nothing more
            assert.ok( !_.difference(actionsPerformed, expected).length );
            done();
        };
    };

    it('should initialize a git repository, with default action(s)', function( done ){
        sketchplate.hooks.gitInit( tmp, test(['init'], done) );
    });

    it('should intialize a git repository, addAll and commit', function( done ){
        var options = {
            addAll: true,
            commit: true
        };

        sketchplate.hooks.gitInit( tmp, options, test(['init','addAll','commit'], done) );
    });

    it('should initialize a git repository, checkout branch, addAll, commit, remoteAdd', function( done ){
        var options = {
            addAll: true,
            branch: 'develop',
            commit: true,
            commitMessage: 'Initial Import',
            remoteName: 'origin',
            remoteAdd: true
        };

        sketchplate.hooks.gitInit( tmp, options, test(['init','checkout','addAll','commit','remoteAdd'], done) );
    });

    it('should fail to initialize in an invalid directory', function( done ){
        sketchplate.hooks.gitInit('/does/not/exist/', function( err, message, code ){
            assert.notEqual( err, null );
            done();
        });
    });
});

