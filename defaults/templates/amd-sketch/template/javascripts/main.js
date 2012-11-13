//load the config first
require(['./config'],function(){
	require(['domReady', 'app/main'], function(domReady, app){
		//once the dom is ready, execute the app
		domReady(app);
	});
});