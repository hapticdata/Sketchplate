var _ = require('underscore');
//#Hooks
//provides automated functionality to perform on already existing projects
exports.initServer = require('./hooks/server');
exports.initRepo = require('./hooks/git-init');
exports.npmInstall = require('./hooks/npm-install');
exports.openInEditor = require('./hooks/editor');
exports.openInFileBrowser = require('./hooks/browse');


//###Project constructor _`hooks.Project`_
//provides functionality on created-projects
//after the template has been copied
function Project ( location, editorArgs ){
	this.location = location;
	this.editorArgs = editorArgs;
    _.chain(exports)
        .filter(function(mthd, name){
            return name !== 'openInEditor';
        })
        .each(function( mthd, name ){
            this[name] = _.partial(mthd, location);
        }, this);

    this.openInEditor = _.partial(exports.openInEditor, editorArgs, location );
}

exports.Project = Project;

