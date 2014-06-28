var _ = require('underscore');
//#Hooks
//provides automated functionality to perform on already existing projects
exports.initServer = require('./hooks/server');
exports.gitInit = require('./hooks/git-init');
exports.npmInstall = require('./hooks/npm-install');
exports.openInEditor = require('./hooks/editor');
exports.openInFileBrowser = require('./hooks/browse');


/**
 * wrap hooks with the current config
 * @param {String} location the directory path to the current project
 * @param {Object} config the config object
 * @returns {Object} the hooks wrapped with current config
 */
exports.createProject = function createProject( location, config ){
    var editorArgs = config.editors[ config.editor ];

    return _.chain(exports)
        //these 2 hooks have different param signatures
        .filter(function(mthd, name){
            return name !== 'openInEditor' && name != 'gitInit';
        })
        //attach these all as partial-applicated functions
        .reduce(function( mem, mthd, name ){
            mem[name] = _.partial(mthd, location);
            return mem;
        }, {})
        //add the rest
        .extend({
            location: location,
            config: config,
            editorArgs: editorArgs,
            gitInit: _.partial( exports.gitInit, location, config ),
            openInEditor: _.partial( exports.openInEditor, location, editorArgs )
        })
        .value();
};

