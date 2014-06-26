var spawn = require('child_process').spawn,
    _ = require('underscore'),
    async = require('async');


module.exports = function(location, options, callback) {
    if( arguments.length == 2 && typeof arguments[1] === 'function' ){
        callback = options;
        options = {};
    }

    options = _.defaults(options||{},{
        addAll: true,
        commit: true,
        origin: null,
        push: true,
        branch: "master"
    });
    //if no origin was specified, we cant push
    if( !options.remoteAdd ){
        options.push = false;
    }


    callback = callback || function() {};
    var error = null,
        message = null;


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
        var settings = { cwd: location, stdio: 'inherit' };
        if( options.verbose ){
            settings.verbose = true;
        }

        var spwn = spawn('git', args, settings);

        spwn.on('error', callback);

        spwn.on('exit', function(){
            actionsPerformed.push(name);
            process.nextTick(callback);
        });
    };


    var waterfall = [],
        actionsPerformed = [];

    function gitInit(callback){
        var git = spawn('git', ['init'], {
            cwd: location
        });
        git.on('exit', function( code ){
            //wait a tick because
            //stderr will be written after exit
            actionsPerformed.push('init');
            process.nextTick(callback);
        });

        git.stdout.setEncoding('utf8');
        git.stdout.on('data', function(data) {
            message = data.replace(/\n/, '');
        });

        git.stderr.setEncoding('utf8');
        git.stderr.on('data', function( err ){
            error = err;
        });

        return git;
    }

    function checkout( callback ){
        //no need to checkout master, your already there
        if( options.branch === 'master' ){
            process.nextTick(callback);
            return;
        }
        var chck = spawn('git', ['checkout','-b', options.branch],{
            cwd: location
        });

        chck.on('exit', function(){
            actionsPerformed.push('checkout');
            process.nextTick(callback);
        });
    }

    waterfall.push(gitInit);
    waterfall.push(checkout);

    //for each one of these specified in `options`, perform the action
    var actions = [
        { name: 'addAll', args: ['add', '-A'] },
        { name: 'commit', args: ['commit', '-m', options.commitMessage] },
        { name: 'remoteAdd', args: ['remote','add',options.remoteName, options.remoteURL] },
        { name: 'push', args: ['push', '-u', options.remoteName, options.branch] }
    ];

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
