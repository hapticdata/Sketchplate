var spawn = require('child_process').spawn,
    _ = require('underscore'),
    async = require('async');


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
    //if no origin was specified, we cant push
    if( !options.remoteAdd ){
        options.push = false;
    }
    options.checkout = !(options.branch === 'master');

    callback = callback || function() {};
    onMessage = onMessage || function() {};

    //for each one of these specified in `options`, perform the action
    var actions = [
        { name: 'init', args: ['init'] },
        { name: 'checkout', args: ['checkout', '-b', options.branch] },
        { name: 'addAll', args: ['add', '-A'] },
        { name: 'commit', args: ['commit', '-m', options.commitMessage] },
        { name: 'remoteAdd', args: ['remote','add',options.remoteName, options.remoteURL] },
        { name: 'push', args: ['push', '-u', options.remoteName, options.branch] }
    ];

    var trimNL = function(a){ return a.replace(/\n/,''); };

    /**
     * setup a base stream that can be used for each action
     * @param {String} name the name of the action to report comleted
     * @param {String} args the arguments to send to git
     * @param {Stream|null} lastProc either the lastProcess or null (depends on async.js order)
     * @param {Function|null} callback null if callback was sent to last param
     */
    var proxyStream = function( name, args, lastProc, callback ){
        if( typeof lastProc === 'function' && !callback ){
            callback = lastProc;
        }

        callback = _.once(callback);

        var settings = { cwd: location };
        var git = spawn('git', args, settings);

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


    var waterfall = [],
        actionsPerformed = [];

    actions.forEach(function( action ){
        if( options[action.name] ){
            waterfall.push( _.partial(proxyStream, action.name, action.args) );
        }
    });

    async.waterfall( waterfall, function( err, message ){
        if( err ){
            callback(err);
            return;
        }
        callback(null, actionsPerformed);
    });
};
