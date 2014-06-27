var spawn = require('win-spawn'),
    _ = require('underscore'),
    async = require('async');


var trimNL = function(a){ return a.replace(/\n/,''); };

/**
 * Initialize a git repo,
 * @param {String} location the folder location
 * @param {Object} [options]
 * @param {boolean} [options.addAll] add all files to the repo
 * @param {String} [options.branch] defaults to master
 * @param {boolean} [options.commit] make an initial commit
 * @param {String} [options.commitMessage] defaults to 'Initial Import'
 * @param {String} [options.remoteName] defaults to 'origin'
 * @param {String} [options.remoteURL]
 * @param {String} [options.push] should push (requires remoteURL)
 * @param {Function} callback( err, actionsPerformed)
 * @param {Function} [onMessage(message)]
 */
module.exports = function(location, options, callback, onMessage) {

    var waterfall = [],
        actionsPerformed = [],
        actions = [],
        wrapStream;

    if( typeof arguments[1] === 'function' ){
        //shift params 1
        onMessage = callback;
        callback = options;
        options = {};
    }

    options = _.defaults(options||{},{
        addAll: false,
        commit: false,
        commitMessage: 'Initial Import',
        remoteName: 'origin',
        push: false,
        branch: 'master'
    });
    //always init the repo
    options.init = true;
    //nothing to commit if files werent added
    if( !options.addAll ){
        options.commit = false;
    }
    //if no origin was specified, we cant push
    if( !options.remoteAdd || !options.commit ){
        options.push = false;
    }
    options.checkout = !(options.branch === 'master');

    callback = callback || function() {};
    onMessage = onMessage || function() {};

    //for each one of these specified in `options`, perform the action
    actions = [
        { name: 'init', args: ['init'] },
        { name: 'checkout', args: ['checkout', '-b', options.branch] },
        { name: 'addAll', args: ['add', '-A'] },
        { name: 'commit', args: ['commit', '-m', options.commitMessage] },
        { name: 'remoteAdd', args: ['remote','add',options.remoteName, options.remoteURL] },
        { name: 'push', args: ['push', '-u', options.remoteName, options.branch] }
    ];


    /**
     * setup a base stream that can be used for each action of an async.js waterfall
     * @param {String} name the name of the action to report comleted
     * @param {String} args the arguments to send to git
     * @param {Stream|null} lastProc either the lastProcess or null (depends on async.js order)
     * @param {Function|null} callback null if callback was sent to last param
     */
    wrapStream = function( name, args, lastProc, callback ){
        var git;
        if( typeof lastProc === 'function' && !callback ){
            callback = lastProc;
        }
        callback = _.once(callback);

        git = spawn('git', args, { cwd: location });

        git.on('error', callback);
        git.stdout.setEncoding('utf8');
        git.stdout.on('data', function(data) {
            onMessage( trimNL(data) );
        });
        git.stderr.setEncoding('utf8');
        git.stderr.on('data', function( err ){
            //a bug in git sends some messages to stderr
            if( typeof err === 'string' && !!err.match(/fatal/) ){
                callback( trimNL(err) );
            } else {
                onMessage( trimNL(err) );
            }
        });

        git.on('exit', function(){
            //wait a tick because
            //stderr will be written after exit
            actionsPerformed.push(name);
            process.nextTick(callback);
        });

        return git;
    };

    actions.forEach(function( action ){
        if( options[action.name] ){
            waterfall.push( _.partial(wrapStream, action.name, action.args) );
        }
    });

    async.waterfall( waterfall, function( err ){
        callback(err, actionsPerformed);
    });
};
