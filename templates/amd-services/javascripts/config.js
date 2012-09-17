requirejs.config({
	shim: {
		'modernizr': { exports: 'Modernizr' },
		'underscore': { exports: '_' },
		'backbone': {
			deps: ['jquery','underscore'],
			exports: 'Backbone'
		},
		'd3': { exports: 'd3' },
		'Three': { exports: 'THREE' },
		'Stats': { exports: 'Stats' },
		'facebook': { exports: 'FB' },
		'twitter-text': { exports: function(){ return twttr.txt; } },
		'instagram': { exports: 'IG' },
		'github': { exports: 'gh' },
		'dropbox': { exports: 'dropbox' }
	},
	paths: {
		//require.js plugins
		'domReady': 'vendor/domReady',
		'text' : 'vendor/text',
		'async': 'vendor/async',
		//service libs
		'dropbox': 'services/dropbox',
		'gmaps': 'services/gmaps',
		'github': 'services/github',
		'youtube': 'services/youtube',
		'facebook': '//connect.facebook.net/en_US/all',
		'instagram': 'services/ig',
		'twitter-text': 'services/twitter-text',
		'youtube': 'services/youtube',
		//vendor libs
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
		'Stats': 'vendor/Stats'
	}
});