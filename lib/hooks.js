var _ = require('underscore');
//#Hooks
//provides automated functionality to perform on already existing projects
exports.initServer = require('./hooks/server');
exports.gitInit = require('./hooks/git-init');
exports.npmInstall = require('./hooks/npm-install');
exports.openInEditor = require('./hooks/editor');
exports.openInFileBrowser = require('./hooks/browse');


//###Project constructor _`hooks.Project`_
//provides functionality on created-projects
//after the template has been copied
function Project ( location, config ){
	this.location = location;
    this.config = config;
	this.editorArgs = config.editors[ config.editor ];
    _.chain(exports)
        .filter(function(mthd, name){
            return name !== 'openInEditor' && name != 'gitInit';
        })
        .each(function( mthd, name ){
            this[name] = _.partial(mthd, location);
        }, this);
    this.gitInit = _.partial(exports.gitInit, location, this.config);
    this.openInEditor = _.partial(exports.openInEditor, location, this.editorArgs );
}

exports.Project = Project;

