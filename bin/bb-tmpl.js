define(function( require, exports, module ){
    var Backbone = require('backbone'),
        _ = require('underscore');

    var <%= type %> = Backbone.<%= type %>.extend({

    });

    exports = module.exports = function(){
        return <%= type %>.apply({}, arguments);
    };

    exports.<%= type %> = <%= type %>;

});
