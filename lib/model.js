var _ = require('underscore'),
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
  attrs = sanitizeData(attrs, this.constructor.properties);
  _.extend(this._updatedAttrs, attrs);
};

Model.prototype.attrs = function() {
  return this._updatedAttrs;
}

Model.prototype.get = function(key) {
  return this.attrs()[key]; 
};

function sanitizeData(attrs, properties) {
  attrs = _.pick(attrs, massAssignableProperties(properties));
  _.each(attrs, function(value, key) {
    attrs[key] = castProperty(value, properties[key]);
  });
  return attrs;
};

function castProperty(value, definition) {
  if(definition.type === Date && !_.isDate(value)) {
    value = new Date(value);
  }
  return value;
};

function massAssignableProperties(properties) {
  var keys = _.filter(_.keys(properties), function(key) {
    return isMassAssignableProperty(properties[key]);
  });
  return keys;
};

function isMassAssignableProperty(property) {
  return !property.protected;
}

/*
 * Static functions and properties
 */

Model.define = function(properties) {
  properties = normalizeProperties(properties);
  var Constructor = function() {
    Model.apply(this, arguments);
  };
  util.inherits(Constructor, Model);
  _.extend(Constructor, Model, {properties: properties});
  return Constructor;
};

function normalizeProperties(properties) {
  properties = _.reduce(properties, function(properties, value, key) {
    properties[key] = normalizeProperty(value);
    return properties;
  }, {});
  return properties;
};

function normalizeProperty(value) {
  return isTypeDefinition(value) ? {type: value} : value;
};

function isTypeDefinition(value) {
  return _.isString(value) || _.contains([String, Number, Boolean, Date], value);
}

module.exports = Model;
