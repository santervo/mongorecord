var _ = require('underscore');

var Schema = function(properties) {
  this.properties = normalizeProperties(properties);
};


Schema.prototype.sanitizeData = function(attrs) {
  attrs = _.pick(attrs, this.massAssignableProperties());
  _.each(attrs, function(value, key) {
    attrs[key] = cast(this.properties[key].type, value);
  }, this);
  return attrs;
};

Schema.prototype.massAssignableProperties = function() {
  var keys = _.filter(_.keys(this.properties), function(key) {
    return !this.properties[key].protected;
  }, this);
  return keys;
};

function cast(Type, value) {
  if(value == null) {
    return null;
  }
  return new Type(value);
};

function normalizeProperties(properties) {
  properties = _.reduce(properties, function(properties, def, key) {
    properties[key] = normalizeProperty(def);
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

module.exports = Schema;

