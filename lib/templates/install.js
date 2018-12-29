var async = require('async'),
    fetch = require('../fetch'),
    fs = require('fs-extra'),
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

    var hasTemplateDirectory = function( dir ) {
        var tmpltDir = path.join(dir, 'template');
        return fs.existsSync(tmpltDir);
    };

    //was this a properly formatted sketchplate template? or just a normal repo
    var hasTemplateJSON = function( dir ){
        var tmpltJSON = path.join(dir, 'template.json');
        return fs.existsSync(tmpltJSON);
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

    ftch.target = path.join(settings.templatesPath, ftch.target);


    //if this template already existed, were gonna remove it
    if( fs.existsSync(ftch.target) ){
        fs.removeSync(ftch.target);
    }


    //fetch it
    fetch( ftch, function(err, ftch){
        if( err ){
          console.log('ERROR UGH: '.red + err);
        }

        function createJSON(){
            var jsonPath = path.resolve(ftch.target + '/template.json');
            var descriptor = { origin: ftch.clone ? ftch.clone : ftch.zip, fetch: {} };
            fs.writeFileSync(jsonPath, JSON.stringify(descriptor,null,"    "));
        }

        //if the repo doesn't have a root 'template/' folder:
        //1. create one in a temp location
        //2. copy the fetched contents into the <temp>/templates/ folder
        //3. copy <temp>/ contents back to template destination
        if( hasTemplateDirectory(ftch.target) ){
            if( !hasTemplateJSON(ftch.target) ){
                createJSON();
            }
            fn(err,ftch);
            return;
        }
        //place a temporary 'template' dir in the root sketchplate folder
        var tmplDir = path.resolve(ftch.target + '/../../template');
        var destDir = path.join(ftch.target, 'template');

        async.series([
            function mkTemplatedir( cb ){
                fs.ensureDir(tmplDir, cb);
            },
            function copyOver( cb ){
                fs.copy(ftch.target, tmplDir, cb);
            },
            function deleteOriginal( cb ){
                try {
                    fs.removeSync(ftch.target);
                } catch( e ){
                    cb( e );
                    return;
                }
                cb();
            },
            function remakeDir( cb ){
                try {
                    console.log('creating path: ' + destDir);
                    fs.ensureDirSync(destDir);
                    console.log('CREATED');
                } catch( e ){
                    cb(e);
                    return;
                }
                cb();
            },
            function moveBack( cb ){
                console.log('COPYING TO: ' + destDir);
                fs.copy(tmplDir, destDir, cb);
            },
            function createTemplateJSON( cb ){
                createJSON();
                cb();
            },
            function deleteTmp( cb ){
                try {
                    fs.removeSync(tmplDir);
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
