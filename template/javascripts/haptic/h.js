define(function(){
	var _isArray = Array.isArray || function(a){
		return a.toString() == '[object Array]';	
	};
	//from underscore.js
	var _breaker = {};
	var _each = function(obj, iterator, context) {
	    if (obj == null) return;
		if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
		  obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
		  for (var i = 0, l = obj.length; i < l; i++) {
		    if (i in obj && iterator.call(context, obj[i], i, obj) === _breaker) return;
		  }
		} else {
		  for (var key in obj) {
		    if (hasOwnProperty.call(obj, key)) {
		      if (iterator.call(context, obj[key], key, obj) === _breaker) return;
		    }
		  }
		}
	};

	var _extend = function(child, sup, proto){
		child.prototype = new sup();
		child.prototype.parent = sup.prototype;
		child.constructor = child;
		if(proto !== undefined){
			for(var prop in proto){
				child.prototype[prop] = proto[prop];
			}
		}
		return child;
	};

	/**
	 * the main haptic public function
	 * @params {Object} the object to apply and chain methods relative to
	 * @returns {Object} public api for the object
	 * @example
	 */


	var haptic = function haptic( a ){

		var	_doChain = true,
			result = function(val){
				return _doChain ? haptic(val).chain() : val;
			};

		var	pub = {
			stack: [],
			chain: function( doChain ){
				doChain = doChain || true;
				_doChain = doChain;
				return this;
			},
			collect: function( fn, n ){
				
				for(var i=0;i<n;i++){
					a.push( fn(i) );
				}
				return a;
			},
			creep: function( key ){
				var old = a;
				a = a[key];
				var res = result(a);
				haptic(this.stack).each(function(history){
					res.stack.push( history );
				});
				res.stack.push( old );
				return res;
			},
			each: function(fn){
				_each(a,fn)
				return result( a );
			},
			get: function(i){
				if(a[i] !== undefined){
					return a[i];
				}
				return result(a);
			},
			pop: function(){
				a = this.stack[this.stack.length-1];
				var res = result(a);
				var stack = this.stack;
				haptic(res.stack).collect(function(i){
					return stack[i];
				}, stack.length - 1);
				return res;
			},
			prop:function() {
				if (arguments.length === 1) {
					var object = arguments[0];

					for(var property in object) {
						if(object.hasOwnProperty(property)) {
							a[property] = object[property];
						}
					}
				}
				else if (arguments.length == 2) {
					a[arguments[0]] = arguments[1];
				}

				return result(a);
			},
			//same as prop but will add it if it didnt exist
			set: function() {
				if (arguments.length === 1) {
					var obj = arguments[0];

					for(var property in obj) {
						//console.log(property);
						a[property] = obj[property];
					}
				} else if (arguments.length == 2) {
					a[arguments[0]] = arguments[1];
				}
				return result(a);
			}
		};

		if(typeof(a) == 'function'){
			pub.extend = function(supr,proto){
				return result(_extend(a,supr,proto));
			};
		}
			
		return pub;
	};

	/*
	 * pass the protected functions into haptic
	 * @example
	 * haptic.each( objA, objB );
	 */
	haptic(haptic).set({
		each: _each,
		isArray: _isArray,
		extend: _extend
	});
	return haptic;
});