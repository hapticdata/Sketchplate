define([
	'jquery',
	'facebook',
	'twitter-text',
	'instagram',
	'gmaps',
	'github',
	'dropbox',
	'youtube'
], function( $, FB, twttr, instagram, gmaps, github, dropbox, youtube ){
	return function app(){

		console.log("facebook", FB);
		console.log('twttr-txt', twttr );
		console.log('instagram', instagram );
		console.log('youtube', youtube );
		console.log('gmaps', gmaps );
		console.log('github', github );
		console.log('dropbox', dropbox );

	};
});