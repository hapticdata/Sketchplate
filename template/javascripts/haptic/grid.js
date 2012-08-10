/**
 * create a grid object from passed parameters
 * @params {Object} requires columns and rows properties, optional x,y,width,height,paddingLeft,paddingRight,paddingTop,paddingBottom
 * @returns {Object}
 */
 define([
 	'toxi/geom/Rect'
 ],function( Rect ){

 	var grid = {

		create: function( params ){

			var exports =  {
				x: params.x || 0,
				y: params.y || 0,
				columns: params.columns,
				rows: params.rows,
				width: params.width || 1,
				height: params.height || 1,
				paddingLeft: params.paddingLeft || 0,
				paddingRight: params.paddingRight || 0,
				paddingTop: params.paddingTop || 0,
				paddingBottom: params.paddingBottom || 0,
				cells: [],
				forEach: function( fn ){
					var i = 0;
					for(var r = 0; r<this.rows; r++){
						for(var c = 0; c<this.columns; c++){
							var cell = this.getCell( c,r );
							//invoke the function in the scope of the Rect, pass it the Rect, column and row
							fn.call(cell,cell, i, c,r);
							i++;
						}
					}
				},
				getCell: function( c, r ){
					return this.cells[ this.getCellIndex(c,r) ];
				},
				getCellIndex: function( c, r){
					//console.log(this.columns + "*" + r+ " + " +c + " = "+ ((this.columns * r) + c));
					return (this.columns * r) + c;
				},
				getCellWidth: function() {
					return (this.width - ((this.paddingLeft+this.paddingRight) * this.columns))  / this.columns;
				},
				getCellHeight: function(){
					return (this.height - ((this.paddingTop+this.paddingBottom) * this.rows)) / this.rows;
				},
				getXForColumn: function( n ){
					var paddingSum = ( (this.paddingLeft+this.paddingRight) * n );
					return this.x + this.paddingLeft + ( this.getCellWidth() * n ) + paddingSum;
				},
				getYForRow: function( n ){
					var paddingSum = ( (this.paddingTop+this.paddingBottom) * n );
					return this.y + this.paddingTop + ( this.getCellHeight() * n ) + paddingSum;
				}
			};
			//populate cells[]
			for(var r=0; r<exports.rows; r++){
				for(var c=0; c<exports.columns; c++){
					var cell = new Rect({
						x: exports.getXForColumn( c ),
						y: exports.getYForRow( r ),
						width: exports.getCellWidth(),
						height: exports.getCellHeight()
					});
					exports.cells.push( cell );
				}
			}
			return exports;
		}
	};

	return grid;
});