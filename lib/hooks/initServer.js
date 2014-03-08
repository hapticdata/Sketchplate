//Initialize a static-file server using connect

var connect = require('connect'),
	http = require('http');

module.exports = function initServer( path, opts, callback ){
	opts = opts || {};
    callback = callback || function(){};

    var port = opts.port || 3000,
        maxAttempts = opts.maxAttempts || 10,
        incrementPortOnError = !!opts.incrementPortOnError,
        app = connect(),
        tryServer;

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



    //try to create a server, if the address is in use,
    //options may specify to increment the port number and try again
    tryServer = (function(){
        var numAttempts = 0;
        return function(){
            numAttempts++;
            http.createServer(app)
                .listen( port, function(){
                    callback( null, app, port );
                })
                .on('error', function(error){
                    if( incrementPortOnError ){
                        port++;
                    }
                    if( numAttempts < maxAttempts ){
                        tryServer();
                    } else {
                        callback(error, app, port);
                    }
                });
        };
    })();
    //kick-off starting a server
    tryServer();
	//add your own middleware on app w/ app.use
	return app;
};
