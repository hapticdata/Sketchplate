define([
    'underscore',
    'text!./fresnel/fragment.fs',
    'text!./fresnel/vertex.vs',
    'gl/glsl'
], function( _, fs, vs, glsl ){
    
    return function shaderProgram( gl, attributes, uniforms ){
        attributes = attributes || {};
        uniforms = uniforms || {};
        _(uniforms).defaults({
            "mRefractionRatio": 1.02,
            "mFresnelBias": 0.1,
            "mFresnelPower": 2.0,
			"mFresnelScale": 1.0,
			"tCube": 1
        });
        return glsl( gl ).createProgram( vs, fs, attributes, uniforms );
    };
    
});