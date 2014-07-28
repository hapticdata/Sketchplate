var connect = require('connect'),
	http = require('http');

/**
 * Initialize a static-file server using connect
 * @param {String} path the path to serve.
 * @param {Object} opts options for the server.
 * @param {Number} [opts.port] the port to serve on.
 * @param {Boolean} [opts.incrementPortOnError] if the server can't start on provided port,
 * should it try the next one?
 * @param {Number} [opts.maxAttempts] the number of attempts to try with
 * `opts.incrementPortOnError`
 * @param {Function} callback( error, server, app, port )
 */
module.exports = exports = function initServer( path, opts, callback ){
	opts = opts || {};

    var app = connect();

    if ( opts.verbose ){
		app.use(connect.logger('dev'));
    }


    app
		.use(connect.static( path ))
		.use(connect.directory( path ))
		.use(function( req, res){
			res.statusCode = 404;
			res.end('Error 404: Page does not exist');
		});



    //kick-off starting a server
    exports.tryToMakeServer( app, opts, callback );
	//add your own middleware on app w/ app.use
	return app;
};


/**
 * try to create a server, if the address is in use,
 * options may specify to increment the port number and try again
 * @param {requestListener} app a connect app object
 * @param {Object} [opts] options object
 * @param {Number} [opts.port] port to start with (default 3000)
 * @param {Number} [opts.maxAttempts] number of times to try (default 10)
 * @param {Boolean} [opts.incrementPortOnError] should keep trying (default true)
 * @param {Function} [callback(err, server, requestListener, port)]
 */
exports.tryToMakeServer = function( app, opts, callback ){
    if( arguments.length === 3 && typeof arguments[1] === 'function' ){
        callback = opts;
        opts = opts || {};
    }
    callback = callback || function(){};
    opts = opts || {};
    /*opts.port = opts.port || 3000;
    opts.maxAttempts = opts.maxAttempts || 10;*/


    var port = opts.port || 3000,
        maxAttempts = opts.maxAttempts || 10,
        incrementPortOnError = !!opts.incrementPortOnError,
        tryServer,
        numAttempts = 0,
        server;

    tryServer = function tryServer(){
        numAttempts++;
        server = http.createServer(app)
            .listen( port, function(){
                callback( null, server, app, port );
            })
            .on('error', function(error){
                if( incrementPortOnError ){
                    port++;
                }
                if( numAttempts < maxAttempts ){
                    tryServer();
                } else {
                    callback(error, server, app, port);
                }
            });
    };

    tryServer();
};

