define([
    'underscore',
    'text!./flat/fragment.fs',
    'text!./flat/vertex.vs',
    'gl/glsl'
], function( _, fs, vs, glsl ){
    return function shaderProgram( gl, attributes, uniforms ){
        attributes = attributes || {};
        uniforms = uniforms || {};
        _(attributes).defaults({
            "vertexPositionAttribute" : 'aVertexPosition',
            'vertexColorAttribute' : 'aVertexColor'
        }); 
        _(uniforms).defaults({
            'pMatrixUniform' : 'uPMatrix',
            'mvMatrixUniform' : 'uMVMatrix'
        });
        return glsl( gl ).createProgram( vs, fs, attributes, uniforms );
    };
});