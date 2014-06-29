/**
 * This script is executed during 'postinstall'
 * it installs the default template into the users templatesPath.
 * default template is located at http://github.com/hapticdata/template-amd-sketch
 */
require('colors');
var sketchplate = require('../lib/sketchplate'),
    config = require('../lib/config').getUserConfig(),
    fs = require('graceful-fs'),
    path = require('path'),
    l = console.log,
    template,
    onComplete;


//repo data
template = {
    repo : 'hapticdata/template-amd-sketch',
    name : 'amd-sketch'
};

//ending the postinstall process
onComplete = function(){
    l('welcome to sketchplate try `'.blue + 'sketchplate -h' + '` to get started'.blue);
    l('editor set to '.blue + config.editor + ' configure your editor with `'.blue + 'sketchplate config editor'+'`'.blue);
};

l('templates located in '.green + config.templatesPath);

//check if the template already exists
fs.exists( path.join(config.templatesPath, template.name), function( exists ){
    if( exists ){
        //template is already installed, skip installing it
        onComplete();
        return;
    }
    //install amd-sketch template
    sketchplate.installTemplate( config, template.repo, template.name, function( err ){
        l('installed '.green + template.repo + ' as template '.green + template.name );
        onComplete();
    });
    l('fetching '.cyan + template.repo);
});

