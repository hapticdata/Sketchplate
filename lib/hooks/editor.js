require('colors');

var sketchplatePath = require('../config').sketchplatePath,
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    isWindows = require('os').platform() === 'win32',
    path = require('path'),
    fs = require('graceful-fs'),
    _ = require('underscore');

/**
 * Launch your project in your editor
 * @param {String} location the path to your project
 * @param {Object} options
 * @param {Array} options.editorArgs the arguments used to launch your editor
 * @param {Function} callback(err)
 */
module.exports = function( location, options, callback ){
    var editorArgs,
        isDirectory = fs.statSync(location).isDirectory();
    //find editorArgs
    if( typeof options === 'object' && options.cmd ){
        editorArgs = options;
    } else if ( !options || !options.editorArgs || !options.editorArgs.cmd ){
        throw new Error('Invalid `options.editorArgs` parameter');
    } else {
        editorArgs = options.editorArgs;
    }

    editorArgs.args = editorArgs.args || [];
    callback = callback || function(){};

    location = path.resolve(location);

    var variables = {
        workspace: location,
        workspaceDir: isDirectory ? location : path.dirname(location),
        sketchplatePath: sketchplatePath,
        process: process
    };

    if( editorArgs.cwd ){
        editorArgs.cwd = _.template( editorArgs.cwd, variables );
    }
    editorArgs.cmd = _.template( editorArgs.cmd, variables );
    editorArgs.args = editorArgs.args.map(function(arg){
        return _.template( arg, variables );
    });


    if(isWindows) {
        exec("start \"sketchplate\" " + editorArgs.cmd + " " + editorArgs.cwd, function(error){
            callback(error);
        });
    } else {
        var editorProcess = spawn(editorArgs.cmd, editorArgs.args, {
            cwd: editorArgs.cwd ? editorArgs.cwd : undefined,
            stdio: 'inherit'
        });

        editorProcess.on('exit', function (code) {
            var error = null;
            if (code !== 0) {
                error = new Error('Editor exited with code '.red + code);
            }
            callback(error);
        });
    }
};
