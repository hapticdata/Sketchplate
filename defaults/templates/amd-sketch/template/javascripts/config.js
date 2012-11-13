/*global requirejs*/
requirejs.config({
	baseUrl: 'javascripts/vendor',
	shim: {
		'async': { exports: 'async' },
		'modernizr': { exports: 'Modernizr' },
		'underscore': { exports: '_' },
		'backbone': { deps: ['jquery','underscore'], exports: 'Backbone' },
		'd3': { exports: 'd3' },
		'three': { exports: 'THREE' },
		'Stats': { exports: 'Stats' }
	},
	paths: {
		'app': '../app'
	}
});