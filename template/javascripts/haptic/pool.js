/**
 * pool creates an object-pool for requesting and releasing objects,
 * if objects are not readily available, new ones can be created or
 * a request-line is created to be notified when objects become available
 */

 define([], function(){

	var pools = {};
	var numPools = 0;

	var	pool = {
		inactiveSize: 0,
		activeSize: 0,
		/**
		 * create a new pool
		 * @param {Object} [create]{String} number to create in pool, [id]{String} unique-identifier, [max]{Number} capacity limit for pool
		 * @param {Function} the function to generate a new object for the pool, should return the object
		 * @returns the pool instance
		 */
		create: function( params, generateFn ){
			numPools++;
			var setDefault = function(prop, val){
				if(params[prop] === undefined){
					params[prop] = val;
				}
			};

			setDefault('id', 'untitled'+numPools);
			setDefault('max', Number.MAX_VALUE);
			setDefault('create', 0);

			var inactiveObjects = [],
				activeObjects = [],
				onCreateCallbacks = [],
				onRequestCallbacks = [],
				onReleaseCallbacks = [],
				requestLine = [];


			var	thePool = {
				/**
				 * create a new object in the pool, 
				 * must use request for access
				 * @returns {pool} this
				 */
				create: function(){
					if(this.isFull()){
						console.warn("Can not create new item in pool "+param.id+", already full");
					} else {
						var newObject = generateFn();
						inactiveObjects.push( newObject );
					}
					return this;
				},
				/**
				 * destroy pool
				 */
				destroy: function(){
					inactiveObjects = [];
					activeObjects = [];
					delete pools[params.id];
				},
				forEach: function( fn ){
					var all = activeObjects.concat( inactiveObjects );
					all.forEach( fn );
					return this;
				},
				forEachActive: function( fn ){
					activeObjects.forEach( fn );
					return this;
				},
				forEachInactive: function( fn ){
					inactiveObjects.forEach( fn );
					return this;
				},
				getActiveSize: function(){
					return activeObjects.length;
				},
				getInactiveSize: function(){
					return inactiveObjects.length;
				},
				getSize: function(){
					return inactiveObjects.length + activeObjects.length;
				},
				/**
				 * is the pool at its max
				 * @returns true if it has reached its max
				 */
				isFull: function(){
					return (this.getSize() == params.max);
				},
				/**
				 * release an object back into the pool
				 * @param {Object} the object to return to the pool
				 * @returns this
				 */
				release: function ( obj, fn ){
					hold( obj );
					if(isWaiting()){
						provide( nextInLine() );
					}
					fn.call(this, null);
					return this;
				},

				/**
				 * request an object from the pool
				 * @param {Function} fn the callback for when an object is ready
				 * @returns this
				 */
				request: function( fn ){
					if(inactiveObjects.length > 0){
						provide( fn );
					} else {
						requestLine.push( fn );
					}
					return this;
				}

			};


			var updateSizes = function(){
				thePool.activeSize = activeObjects.length;
				thePool.inactiveSize = inactiveObjects.length;
			};
			var nextInLine = function(){
				return requestLine.shift();
			};

			var isWaiting = function(){
				return requestLine.length > 0;
			};
			var hold = function( o ){
				var index = activeObjects.indexOf( o );
				if(index < 0 ){
					console.warn("Asked to release an object that was never requested");
				} else {
					activeObjects.splice( index, 1 );
					inactiveObjects.push( o );
				}
				updateSizes();
			};
			var provide = function( fn ){
				var o = inactiveObjects.shift();
				activeObjects.push( o );
				updateSizes();
				fn.call(thePool, null, o );
			};


			while(params.create > 0){
				thePool.create();
				params.create--;
			}
			updateSizes();
			if(params.forEach !== undefined){
				thePool.forEach( params.forEach );
			}
			//put into the list of pools;
			pools[params.id] = thePool;
			return thePool;
		},
		get: function( id ){
			if(id == undefined){
				return pools;
			}
			return pools[id];
		}
	};
	return pool;
});
