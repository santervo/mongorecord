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

Schema.prototype.validate = function(attrs, done) {
  var errors = _.reduce(attrs, this.validateAttr, {}, this);
  done(_.isEmpty(errors) ? null : {errors: errors});
};

Schema.prototype.validateAttr = function(errors, value, key) {
  if(value != null) {
    this.validateType(errors, value, key);
  }
  return errors;
};

Schema.prototype.validateType = function(errors, value, key) {
  var type = this.properties[key].type;

  if(type === String && !_.isString(value)) {
    errors[key] = "is not a String";
  }
  else if(type === Number && (!_.isNumber(value) || _.isNaN(value))) {
    errors[key] = "is not a Number";
  }
  return errors;
}

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

