/**
 * Metrics module is meant to be an object that you can throw various counters in,
 * for easy access to numbers of operations currently active,
 * such as for "watch expressions" in Chrome Developer Tools
 */
define([], function(){

	var metrics = {};

	var makeMetric = function( key, val ){
		if(val === undefined){
			val = 0;
		};
		if(metrics[key] !== undefined){
			console.warn("attempted to overwrite existing metric ["+key+"]");
		} else {
			metrics[key] = val;
		}
	};

	return {
		create: function( key, val ){
			makeMetric(key, val);
			return this;
		},
		destroy: function( key ){
			delete metrics[key];
		}
	}

});