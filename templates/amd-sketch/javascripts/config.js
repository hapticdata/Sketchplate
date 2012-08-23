requirejs.config({
	shim: {
		'modernizr': {
			exports: 'Modernizr'
		},
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['jquery','underscore'],
			exports: 'Backbone'
		},
		'd3': {
			exports: 'd3'
		},
		'Three': {
			exports: 'THREE'
		},
		'Stats': {
			exports: 'Stats'
		}
	},
	paths: {
		'modernizr': 'vendor/modernizr',
		'd3': 'vendor/d3',
		'jquery': [
			'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
			//If the CDN location fails, load local copy
			'vendor/jquery'
		],
		'toxi': 'vendor/toxi',
		'dat': 'vendor/dat',
		'backbone': 'vendor/backbone',
		'underscore': 'vendor/underscore',
		'three': 'vendor/three',
		'Stats': 'vendor/Stats',
		'domReady': 'vendor/domReady',
		'text' : 'vendor/text'
	}
});