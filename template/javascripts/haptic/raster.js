define([], function(){

	var exports = {};
	exports.getCanvas = function( o, options, fn ){
		if(typeof options == 'function'){
			fn = options;
			options = {};
		}
		//if its a reference to an image to load
		var err = null;
		var draw = function( img ){
			var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d');
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			fn( err, canvas, ctx );
		};
		if(typeof o == 'string'){
			var img = new Image();
			img.onload = function(){
				draw( img );
			};
			img.src = o;
		} else if(typeof o == 'object'){
			if(o instanceof Image){
				draw( o );
			} else if( o instanceof HTMLCanvasElement){
				fn( err, o, o.getContext('2d'));
			}
		} else {
			err = { message: "not implemented" };
			fn( err );
		}
	};
	exports.getPixels = function( o, options, fn ){
		if(typeof options == 'function'){
			fn = options;
			options = {};
		}
		exports.getCanvas( o, function( err, canvas, ctx ){
			if(err != null ){
				fn( err );
			} else {
				var data = ctx.getImageData(0,0,canvas.width,canvas.height);
				fn( err, data, canvas, ctx );
			}
		});
	};

	exports.getPixel = function( o, x, y, fn){
		var pixelData;
		var exit = function(){
			var i = (x + y * pixelData.width) * 4;
			var pixel = {
				red: pixelData.data[i],
				green: pixelData.data[i+1],
				blue: pixelData.data[i+2],
				alpha: pixelData.data[i+3]
			};
			fn( pixel );
		};
		if(o.hasOwnProperty('data') && o.hasOwnProperty('width') && o.hasOwnProperty('height')){
			pixelData = o;
			exit();
		} else {
			exports.getPixels(o, function( pixels ){
				pixelData = pixels;
				exit();
			});
		}
	};
	var raster = function( o ){

		return {
			getCanvas: function( fn ){
				exports.getCanvas( o, fn );
				return this;
			},
			getPixels: function( fn ){
				exports.getPixels( o, fn );
				return this;
			},
			getPixel: function( x, y, fn ){
				exports.getPixel( o, x, y, fn );
				return this;
			}
		};		
	};


	return raster;

});