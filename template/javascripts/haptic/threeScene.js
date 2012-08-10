define([
	'haptic/h',
	'three'
], function( h, THREE ){

	return function hThree( ){
		var settings = {};
		var fn;
		if( arguments.length == 2){
			settings = arguments[0];
			fn = arguments[1];
		} else {
			fn = arguments[0];
		}
		settings.container = settings.container || document.createElement('div');
		settings.width = settings.width || settings.container.width || window.innerWidth;
		settings.height = settings.height || settings.container.height || window.innerHeight;
		settings.aspect = settings.width / settings.height;
		settings.near = settings.near || 0.1;
		settings.far = settings.far || 10000;
		settings.scene = settings.scene || new THREE.Scene();
		settings.camera = settings.camera || new THREE.PerspectiveCamera( 65, settings.aspect, settings.near, settings.far );
		settings.renderer = settings.renderer || new THREE.WebGLRenderer({ antialias: true });

		settings.renderer.setSize( settings.width , settings.height );
		settings.container.appendChild( settings.renderer.domElement );
		fn.apply(settings, [settings.container, settings.scene, settings.camera, settings.renderer]);
	};
});
