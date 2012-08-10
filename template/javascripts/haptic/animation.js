define([], function(){
	/**
	 * animator factory for creating requestAnimationFrame callbacks 
	 * and simplifying their cancellation. Includes Erik Moller polyfill
	 * @author Kyle Phillips
	 * @example
	 * animator(function(){
	 * 	//do this every time
	 * 	if(Math.random() > 0.9){
	 *		this.complete();	
	 * 	}	
	 * }).onComplete(function(){
			console.log("animation completed");
	 * }});
	 */

	var animator = {};

	/**
	 * Polyfill for requestAnimationFrame and cancelAnimationFrame
	 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	 */
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = 
		  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
 
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
	};


	/**
	 * Main functionality,
	 * _Animator is inside closure, not publicly available, use animator()
	 */

	var _Animator = function(){
		this.frameCount = 0;
		this.__onCompleteCallbacks = [];
		this.__onStepCallbacks = [];
		this.__onStopCallbacks = [];
		this.__animating = false;
		this.__complete = false;
	};

	_Animator.prototype = {
		animate: function(callback){
			
			var self = this;
			var step = function(){
				self.frameCount++;
				for(var i=0, len = self.__onStepCallbacks.length; i<len; i++){
					self.__onStepCallbacks[i].call(self, self.frameCount);
				}
			}
			//dont let it double-up
			if(this.__animating){
				return this;
			}
			if(this.__onStep === undefined && callback === undefined){
				console.warn("animator received no function, cancelled");
			}
			if(callback !== undefined){
				this.__onStepCallbacks.unshift(callback);
			}
			this.__animating = true;
			
			var	drawFrame = function(){
				step();
				if(self.__animating){
					self.request = requestAnimationFrame(drawFrame);
				} else {
					cancelAnimationFrame(self.request);
				}
			};
			drawFrame();

			return this;
		},
		complete: function(){
			this.__animating = false;
			this.__complete = true;
			this.stop();
			for(var i=0, len = this.__onCompleteCallbacks.length; i< len; i++){
				this.__onCompleteCallbacks[i].apply( this );
			}
			return this;
		},
		onComplete: function(fn){
			if(!fn)return;
			this.__onCompleteCallbacks.push( fn );
			return this;
		},
		onStep: function(fn){
			if(!fn)return;
			this.__onStepCallbacks.push( fn );
			return this;
		},
		onStop: function(fn){
			if(!fn)return;
			this.__onStopCallbacks.push( fn );
			return this;
		},
		resume: function(){
			this.animate();
			return this;
		},
		stop: function(){
			this.__animating = false;
			for(var i=0, len = this.__onStopCallbacks.length; i< len; i++){
				this.__onStopCallbacks[i].apply( this );
			}
			return this;
		}
	};

	animator.create = function( fn ){
		//if only one param was sent it should be the function
		var _instance = new _Animator();
		return _instance.animate(fn);
	};

	return animator;

});