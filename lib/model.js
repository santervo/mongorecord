var _ = require('underscore'),
    Schema = require('./schema');
    util = require('util');

/*
 * Constructor
 */
var Model = function(attrs) { 
  this._updatedAttrs = {};
  if(attrs) {
    this.merge(attrs);
  }
};

/*
 * Prototype functions
 */

Model.prototype.set = function(attrs) {
  attrs = this.constructor.schema.sanitizeData(attrs);
  _.extend(this._updatedAttrs, attrs);
};

Model.prototype.attrs = function() {
  return this._updatedAttrs;
}

Model.prototype.get = function(key) {
  return this.attrs()[key]; 
};

/*
 * Static functions and properties
 */

Model.define = function(properties) {
  var Constructor = function() {
    Model.apply(this, arguments);
  };
  util.inherits(Constructor, Model);
  _.extend(Constructor, Model, {schema: new Schema(properties)});
  return Constructor;
};

module.exports = Model;
