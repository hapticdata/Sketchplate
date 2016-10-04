/**
 * This script is executed during 'postinstall'
 * it installs the default template into the users templatesPath.
 * default template is located at http://github.com/hapticdata/template-amd-sketch
 */
require('colors');
var sketchplate = require('../lib/sketchplate'),
    config = require('../lib/config'),
    userConfig,
    fs = require('graceful-fs'),
    path = require('path'),
    l = console.log,
    template,
    onComplete;


if(config.isSudo){
    console.log('DO NOT INSTALL AS SUDO, skipping postinstall, run `'.red + 'sketchplate -h'.white + '` without sudo'.red);
    return;
}

//repo data
template = {
    repo : 'hapticdata/template-amd-sketch',
    name : 'amd-sketch'
};

//ending the postinstall process
onComplete = function(){
    l('welcome to sketchplate try `'.blue + 'sketchplate -h' + '` to get started'.blue);
    l('configure sketchplate with `'.blue + 'sketchplate config -e'+'`'.blue);
    l('editor set to '.blue + userConfig.editor);
};

config.restoreUserConfig(function( err ){
    config.restoreUserReadme(function(err){
        userConfig = config.getUserConfig();
        l('templates located in '.green + userConfig.templatesPath);

        //check if the template already exists
        fs.exists( path.join(userConfig.templatesPath, template.name), function( exists ){
            if( exists ){
                //template is already installed, skip installing it
                onComplete();
                return;
            }
            //install amd-sketch template
            sketchplate.installTemplate( userConfig, template.repo, template.name, function( err ){
                l('installed '.green + template.repo + ' as template '.green + template.name );
                onComplete();
            });
            l('fetching '.cyan + template.repo);
        });
    });
});

