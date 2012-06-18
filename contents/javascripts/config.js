require.config({
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['underscore'],
			exports: 'Backbone'
		},
		'Three': {
			exports: 'THREE'
		},
		'Stats': {
			exports: 'Stats'
		}
	},
	paths: {
		'jquery': [
			'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
			//If the CDN location fails, load local copy
			'vendors/jquery'
		],
		'toxi': 'vendors/toxi',
		'dat': 'vendors/dat',
		'backbone': 'vendors/backbone',
		'underscore': 'vendors/underscore',
		'Three': 'vendors/Three',
		'Stats': 'vendors/Stats',
		'domReady': 'vendors/plugins/domReady',
		'text' : 'vendors/plugins/text'
	}
});
require(['domReady', 'app/main'], function(domReady, app){
	domReady(function(){
		//once the dom is ready, execute the app
		app();
	});
});