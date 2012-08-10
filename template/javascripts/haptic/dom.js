define([
	'jquery',
	'toxi/geom/Vec2D'
],function( $, Vec2D ){


	var	calculateOffset = function(curElement, event,ignoreWindowOffset) {
		var element = curElement,
		offsetX = 0,
		offsetY = 0;

		if (element.offsetParent) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
			} while ( !!(element = element.offsetParent) );
		}
		element = curElement;
		do {
			offsetX -= element.scrollLeft || 0;
			offsetY -= element.scrollTop || 0;
		} while ( !! (element = element.parentNode));
		offsetX += parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingLeft"], 10) || 0;
		offsetY += parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingTop"], 10) || 0;
		offsetX += parseInt(document.defaultView.getComputedStyle(curElement, null)["borderLeftWidth"], 10) || 0;
		offsetY += parseInt(document.defaultView.getComputedStyle(curElement, null)["borderTopWidth"], 10) || 0;

		if(!ignoreWindowOffset){
			offsetX += window.pageXOffset;
			offsetY += window.pageYOffset;
		}
		return {
			x: offsetX,
			y: offsetY
		};
	},
	getMouse = function(element,event,ignoreWindowOffset){
		var offset = calculateOffset(element,event,ignoreWindowOffset);
		return {
			x: event.pageX-offset.x,
			y: event.pageY - offset.y,
			toString: function(){
				return "{ x: "+this.x+ ", y: "+this.y+" }";
			}
		};
	};

	return function( element ){
		var exports = {};
		exports.offset = function(event, ignoreWindowOffset){
			return calculateOffset( element, event, ignoreWindowOffset);
		};
		exports.mouse = function( event, ignoreWindowOffset){
			return getMouse(element, event, ignoreWindowOffset);
		};
		exports.trackMouse = function(ignoreWindowOffset){
			var mouse = new Vec2D();
			$(element)
				.mousemove(function (e){
					mouse.isOver = true;
					mouse.set(getMouse( element, e, ignoreWindowOffset));
				})
				.mouseout(function (e){
					mouse.isOver = false;
				});
			return mouse;
		};
		return exports;
	};
});