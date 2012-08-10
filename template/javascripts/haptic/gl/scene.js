define([
	'toxi/geom/Matrix4x4'
], function( Matrix4x4 ){
	
	var createMatrixUtil = function(){

		return {
			matrix: new Matrix4x4(),
			stack: [],
			float32Array: new Float32Array( 16 ),
			getMatrix: function(){
				/*
					Matrix4x4#transpose() converts the matrix between
					column-major to row-major (the way that WebGL/OpenGL wants it),
					by providing Float32Array's we optimize by changing values
					instead of constructing new objects
				*/
				this.matrix.transpose().toArray(this.float32Array);
				return this.float32Array;
			},
			popMatrix: function(){
				if (this.stack.length === 0) {
					throw "Invalid popMatrix!";
				}
				this.matrix = this.stack.pop();
			},
			pushMatrix: function(){
				this.stack.push( this.matrix.copy() );
			}
		};
	};

	return function scene( params, fn ){
		var exports = {},
			viewport = params.viewport || { width: window.innerWidth, height: window.innerHeight },
			canvas = params.canvas || document.createElement( 'canvas' ),
			gl,
			mvMatrix = params.mvMatrix || params.modelViewMatrix || createMatrixUtil(),
			pMatrix = params.pMatrix || params.projectionMatrix || createMatrixUtil();
			
		viewport.aspect = function(){
			return this.width / this.height;
		};

		canvas.width = viewport.width;
		canvas.height = viewport.height;
			
		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		} catch (e) {
		}
		if (!gl) {
			alert("Could not initialise WebGL, sorry :-(");
		}
		
		exports.viewport = viewport;
		exports.canvas = canvas;
		exports.gl = gl;
		exports.mvMatrix = mvMatrix;
		exports.pMatrix = pMatrix;
		fn.call(exports, canvas, gl, mvMatrix, pMatrix);
	};
});