var async = require('async'),
    mkdirp = require('mkdirp'),
    wrench = require('wrench'),
    fetch = require('../fetch'),
    fs = require('graceful-fs'),
    path = require('path');

//install a template
//
//* ##{Object}** settings,
//* ##{String}** settings.templatesPath, the path to where the templates are located
//* **{String}** package, the url or reference for downloading the template
//* **{String}** folder, the destination path
//* **{Function}** fn, the callback with with param `(error, ftch)`
module.exports = function installTemplate( settings, packg, folder, fn ){
    fn = fn || function(){};
    //was this a properly formatted sketchplate template? or just a normal repo
    var isValidTemplate = function( dir ){
        return fs.existsSync(dir+'/template') && fs.existsSync(dir+'/template.json');
    };

    var ftch = {};
    if( packg.indexOf('://') > 0 ){
        if( packg.indexOf('.zip') > 0 ){
            ftch.zip = packg;
        } else {
            ftch.clone = packg;
        }
        ftch.target = packg.slice( packg.lastIndexOf('/')+1, packg.length );
    } else if( packg.indexOf('/') ){
        //if theres a tag specified (i.e. <name>/<repo>#<tag>)
        (function(i){
            if( i <= 0 ){ return; }
            ftch.tag = packg.slice(i+1, packg.length);
            packg = packg.slice(0, i);
        }(packg.indexOf('#')));
        ftch.clone = 'https://github.com/'+packg+'.git';
        ftch.target = packg.slice( packg.indexOf('/')+1, packg.length );
    } else {
        fn( new Error('improper package supplied') );
        return;
    }
    //if the folder param wasn't provided, but a callback was
    if( arguments.length === 3 && typeof arguments[2] === 'function' ){
        fn = arguments[2];
        folder = undefined;
    }
    //if a folder was specified use that
    if( folder && folder.length ){
        ftch.target = folder;
    }
    //if it ends in .git remove it from the folder name
    //example bower.git should be "bower"
    var strip = (function(t){
        return function(ext){
            if( t.indexOf(ext) > 0 ){
                return t.slice(0, t.indexOf(ext));
            }
            return t;
        };
    }(ftch.target));

    ftch.target = strip('.git');
    ftch.target = strip('.zip');

    ftch.target = path.resolve(settings.templatesPath + '/' + ftch.target);


    //if this template already existed, were gonna remove it
    if( fs.existsSync(ftch.target) ){
        wrench.rmdirSyncRecursive(ftch.target);
    }


    //fetch it
    fetch( ftch, function(err, ftch){
        if( err ){
          console.log('ERROR UGH: '.red + err);
        }
        //if the repo doesn't have a root 'template/' folder:
        //1. create one in a temp location
        //2. copy the fetched contents into the <temp>/templates/ folder
        //3. copy <temp>/ contents back to template destination
        if( isValidTemplate(ftch.target) ){
            fn(err,ftch);
            return;
        }
        //place a temporary 'template' dir in the root sketchplate folder
        var tmplDir = path.resolve(ftch.target + '/../../template');
        var destDir = path.resolve(ftch.target + '/template');

        async.series([
            function mkTemplatedir( cb ){
                mkdirp(tmplDir, cb);
            },
            function copyOver( cb ){
                wrench.copyDirRecursive(ftch.target, tmplDir, cb );
            },
            function deleteOriginal( cb ){
                try {
                    wrench.rmdirSyncRecursive(ftch.target);
                } catch( e ){
                    cb( e );
                    return;
                }
                cb();
            },
            function remakeDir( cb ){
                try {

                    console.log('creating path: ' + destDir);
                    mkdirp.sync(destDir);
                    console.log('CREATED');
                    //wrench.mkdirSyncRecursive(ftch.target+'/template', 0777);
                } catch( e ){
                    cb(e);
                    return;
                }
                cb();
            },
            function moveBack( cb ){
                console.log('COPYING TO: ' + destDir);
                wrench.copyDirRecursive(tmplDir, destDir, cb);
            },
            function createJSON( cb ){
                var jsonPath = path.resolve(ftch.target + '/template.json');
                console.log('CREATING JSON at: ' + jsonPath);
                var descriptor = { origin: ftch.clone ? ftch.clone : ftch.zip, fetch: {} };
                fs.writeFile(jsonPath, JSON.stringify(descriptor,null,"    "), cb);
            },
            function deleteTmp( cb ){
                try {
                    wrench.rmdirSyncRecursive( tmplDir );
                } catch( e ){
                    cb(e);
                    return;
                }
                cb();
            }
        ], function( err, results ){
            if( err ){
                console.log('Error: ', err );
                fn(err);
                return;
            }
            fn(null,ftch);
        });
    });
};
