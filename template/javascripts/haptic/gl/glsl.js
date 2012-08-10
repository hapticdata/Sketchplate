define([],
function(){
	return function( gl ){

        var exports = {};
		var createShader = function( shaderSource, type ){
			var shader = gl.createShader( type );
			gl.shaderSource( shader, shaderSource );
			gl.compileShader( shader );

			if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert( gl.getShaderInfoLog(shader) );
				return null;
			}
			return shader;
		};

        var applyAttributes = function( shaderProgram, attributes ){
            var prop = "";
            for( prop in attributes ){
				shaderProgram[prop] = gl.getAttribLocation( shaderProgram, attributes[prop] );
                gl.enableVertexAttribArray(shaderProgram[prop]);
			}
            return exports;
        };

        var applyUniforms = function( shaderProgram, uniforms ){
            if ( shaderProgram.uniformsCache === undefined ){
                shaderProgram.uniformsCache = {};
			}
            for( var prop in uniforms ){
				shaderProgram[prop] = gl.getUniformLocation( shaderProgram, uniforms[prop] );
                shaderProgram.uniformsCache[ prop ] = gl.getUniformLocation( shaderProgram, uniforms[prop] );
			}
            return exports;
        };


		var createProgram = function( vs, fs, attributes, uniforms ){
			var frag = createShader(fs, gl.FRAGMENT_SHADER),
				vert = createShader(vs, gl.VERTEX_SHADER),
                shaderProgram = gl.createProgram();
                
            //attach shaders to shaderProgram    
			gl.attachShader( shaderProgram, vert );
			gl.attachShader( shaderProgram, frag );
            //link program to gpu
			gl.linkProgram( shaderProgram );

			if( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS) ){
				alert("Could not initialize shaders");
			}
            
            //set as a part of current OpenGL state
            gl.useProgram( shaderProgram );

            shaderProgram.attributes = function( attributes ){
                applyAttributes( shaderProgram, attributes );
                return shaderProgram;
            };

            shaderProgram.uniforms = function( uniforms ){
                applyUniforms( shaderProgram, uniforms );
                return shaderProgram;
            };

            shaderProgram.use = function(){
                gl.useProgram( shaderProgram );
                return shaderProgram;
            };
            
            shaderProgram.del = function(){
                gl.deleteProgram( shaderProgram );
            };

			applyAttributes( shaderProgram, attributes );
            applyUniforms( shaderProgram, uniforms );


			return shaderProgram;
		};

        exports.createProgram = createProgram;
        exports.attributes = applyAttributes;
        exports.uniforms = applyUniforms;
		return exports;
	};
});