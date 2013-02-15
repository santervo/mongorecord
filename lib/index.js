var Model = require('./model'),
    Schema = require('./schema'),
    util = require('util'),
    _ = require('underscore');

exports.defineModel = function(opts) {
  var Constructor = function() {
    Model.apply(this, arguments);
  };
  util.inherits(Constructor, Model);
  opts.schema = new Schema(opts.properties);
  _.extend(Constructor, Model, opts);
  return Constructor;
}
