require.config({
	paths: {
		/*
			if you would like to change your directory structure, reference the modules here
			i.e. create a javascripts/vendors/ folder and use like this:
			'jquery': 'vendors/jquery',
		*/
		'domReady': 'require/domReady',
		'order':  'require/order',
		'text' : 'require/text'
	}
});
require(['domReady', 'app/main'], function(domReady, app){
	domReady(function(){
		//once the dom is ready, execute the app
		app();
	});
});