require('colors');

var program = require('commander'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    sketchplate = require('../lib/sketchplate'),
    hooksCli = require('./hooks-cli'),
    config = require('../lib/config').getUserConfig(),
    plate;

program
    .option('-p, --printpath', 'print templates path')
    .option('-t, --template', 'print the name of the set template');
/**
* creates a handler for reporting the status of a fetch
* @api private
*/
var onFetchProgress = function( err, lib ){
    if( err ){
        console.error( err.red );
        return;
    }
    console.log( '+\tfetched '.green, lib.id );
};


hooksCli.appendHelp(
    program
        .command('new [name]')
)   .description('create a new template')
    .action(function( name, options ){
        //mixin extra params like 'rawArgs' from the program object
        options = _.defaults(options, program);
        var waterfall = [
            function collectName( next ){
                //if a name wasnt provided, ask for it
                if( name === undefined ){
                    program.prompt("Name: ", function( _name ){
                        name = _name;
                        next();
                    });
                } else {
                    next();
                }
            },
            function collectDescription( next ){
                program.prompt("Description: ", function( description ){
                    sketchplate.createTemplate( config, {
                        name: name,
                        description: description
                    }, next);
                });
            }
        ];

        hooksCli.createWaterfall( options, waterfall );

        async.waterfall( waterfall, function( err ){
            if( err ){
                throw err;
            }
            process.exit();
        });

    });


hooksCli.appendHelp(
    program
        .command('edit [name]')
)   .description('edit an existing template')
    .action(function( name, options ){
        //mixin extra params like 'rawArgs' from the program object
        options = _.defaults(options, program);
        options.editor = true;
        var tmplDir = config.templatesPath;
        name = name || config.template;
        tmplDir += '/'+name;
        if( !fs.existsSync(tmplDir) ){
            throw Error("The template "+name+" does not exist");
        }

        var waterfall = [function( next ){
            next( null, tmplDir );
        }];
        hooksCli.createWaterfall( options, waterfall );
        async.waterfall( waterfall, function( err ){
            if( err ){
                throw err;
            }
        });
    });

program
    .command('fetch [names…]')
    .description('fetch resources for a template')
    .option('-a, --all', 'Fetch new copies of all resources for template')
    .option('-i, --interactive', 'Fetch resources individually in interactive mode')
    .option('-l, --list', 'List the template\'s fetch resources')
    .option('-t, --template [template]', 'Fetch resources for [template]', undefined)
    .action(function( options ){
        var names = [];
        Array.prototype.forEach.call( arguments, function( arg ){
            if( arg === undefined ){
                return ;
            }
            if( arg.options ){
                options = arg;
            } else {
                names.push( arg );
            }
        });
        //if the argument was an options object
        if(options.template){
            config.template = options.template;
        }
        var plate = sketchplate.create( config );
        if( options.list ){
            console.log("Template `".cyan +plate.config.template+"` lists the following resources:".cyan);
            plate.resources.forEach(function( resource, i ){
                console.log(((i+1)+') ').cyan+resource.id );
            });
        }
        var report = function( err ){
            if( err ){
                console.error( err.message.red );
            } else {
                console.log("Fetched resources completed".green);
            }
            process.exit();
        };
        //if all resources should be fetched
        if( options.all ){
            plate.fetchAll( report, onFetchProgress );
            return;
        }
        //otherwise, if it should be the interactive version
        if( options.interactive ){
            var list = [];
            plate.resources.forEach(function( val ){
                list.push( val.id );
            });
            program.choose( list, function( index ){
                var resource = plate.resources[index];
                sketchplate.fetch( resource, report );
            });
            return;
        }

        if( names.length > 0 ){
            //if the arguments were individual resources to fetch
            console.log("Names: ", names);
            plate.fetch( names, function( err ){
                if( err ){
                    console.log( 'sketchplate err: ',err );
                } else {
                    console.log("Fetched resources completed");
                }
            });
            return;
        }
        //fetch only missing
        plate.fetchMissing( report );
    });

program
    .command('install <package> [folder]')
    .description('install a new template')
    .action(function( pkg, folder ){
        sketchplate.installTemplate( config, pkg, folder, function(err,status){
            if( err ){
                console.error('Sketchplate encountered an error with '.red + pkg +':\n' + err );
            } else {
                console.log('installed '.green + pkg + ' as template '.green + status.target.slice(status.target.lastIndexOf('/')+1,status.target.length) );
            }
        });
        console.log( 'fetching '.cyan + pkg );
    });

program
    .command('list')
    .description('list all of the installed templates')
    .action(function(){
        console.log("Sketchplate has the following templates installed:".cyan);
        getTemplateListing(function( err, templates ){
            templates.forEach(function( name, i ){
                console.log(((i+1)+') ').cyan+name);
            });
        });
        function getTemplateListing( next ){
            var dirs = [];
            //read the templatesPath
            fs.readdir( config.templatesPath, function( err, files ){
                //for every file get a stats, collect directories
                //pass down waterfall once directories are collected
                async.forEach( files, function( file, cb ){
                    fs.stat( config.templatesPath+'/'+file, function( err, stats){
                        if( !err && stats.isDirectory() ){
                            dirs.push( file );
                        }
                        cb( err );
                    });
                }, function( err ){
                    //pass directories to next waterfall item
                    next( err, dirs );
                });
            });
        }
    });

program
    .command('path [name]')
    .description('print the path of a template')
    .action(function( name ){
        var dir = config.templatesPath + '/' + (name || config.template);

        if( fs.existsSync(dir) ){
            console.log(dir);
        } else {
            console.log(('Error: template ' + name + ' does not exist').red);
        }
    });

program
    .command('remove <name>')
    .description('remove an existing template')
    .action(function( name ){
        sketchplate.removeTemplate( config, name, function( err ){
            if( err ){
                console.log( err.message );
            } else {
                console.log('Template ',name,' has been deleted');
            }
        });
    });

program
    .command('set <name>')
    .usage('<name>')
    .description('set the default template, currently `'+config.template.cyan+'`')
    .action(function( name ){
        config.template = name;
        config.writeUserConfig();
    });


program.parse( process.argv );

if( program.printpath ){
    console.log(config.templatesPath);
}
if( program.template ){
    console.log(config.template);
}
