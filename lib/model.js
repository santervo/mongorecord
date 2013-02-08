var _ = require('underscore'),
    Schema = require('./schema');

/*
 * Constructor
 */
var Model = function(attrs) { 
  if(attrs) {
    this.merge(attrs);
  }
};

/*
 * Prototype functions
 */

Model.prototype.merge = function(attrs) {
  attrs = _.pick(attrs, this.constructor.massAssignableProperties());
  _.extend(this, attrs);
};


/*
 * Static functions and properties
 */

// Schema
Model.properties = {};

Model.massAssignableProperties = function() {
  return _.keys(this.properties);
};

// Extends model class with static props
// copied from Backbone.js
Model.extend = function(staticProps) {
  var parent = this;
  var child = function() {
    parent.apply(this, arguments);
  };
  _.extend(child, parent, staticProps);
  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();
  return child;
};

module.exports = Model;
