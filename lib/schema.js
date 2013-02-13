var _ = require('underscore'),
    ObjectID = require('./objectid');

var Schema = function(properties) {
  this.properties = normalizeProperties(properties);
};

Schema.prototype.sanitizeData = function(attrs) {
  attrs = _.pick(attrs, this.massAssignableProperties());
  _.each(attrs, function(value, key) {
    attrs[key] = sanitizeProperty(value, this.properties[key]);
  }, this);
  return attrs;
};

Schema.prototype.validate = function(attrs, done) {
  var errors = this._validate(attrs);
  done(_.isEmpty(errors) ? null : {errors: errors});
};

Schema.prototype._validate = function(attrs) {
  return _.reduce(attrs, this.validateAttr, {}, this);
}

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
  else if(type === Date && (!_.isDate(value) || _.isNaN(value.getTime()))) {
    errors[key] = "is not a Date";
  }
  else if(type === Boolean && !_.isBoolean(value)) {
    errors[key] = "is not a Boolean";
  }
  else if(type === ObjectID && !isObjectID(value)) {
    errors[key] = "is not an ObjectID";
  }
  else if(type === Object) {
    var subSchema = new Schema(this.properties[key].properties);
    var embeddedErrors = subSchema._validate(value);
    if(!_.isEmpty(embeddedErrors)) {
      errors[key] = embeddedErrors;
    }
  }
  else if(type === Array) {
    var subDef = { 
      item: { 
        type: this.properties[key].item_type,
        properties: this.properties[key].item_properties
      }
    };
    var subSchema = new Schema(subDef);
    var subErrors = {};
    _.each(value, function(value, index) {
      var errors = subSchema._validate({item: value});
      if(!_.isEmpty(errors)) {
        subErrors[index] = errors.item;
      }
    });
    if(!_.isEmpty(subErrors)) {
      errors[key] = subErrors;
    }
  }
  return errors;
}

Schema.prototype.massAssignableProperties = function() {
  var keys = _.filter(_.keys(this.properties), function(key) {
    return !this.properties[key].protected;
  }, this);
  return keys;
};

function sanitizeProperty(value, property) {
  if(property.type === Object) {
    var subSchema = new Schema(property.properties);
    return subSchema.sanitizeData(value);
  }
  else if(property.type === Array) {
    var subDef = { 
      item: { 
        type: property.item_type,
        properties: property.item_properties
      }
    };
    var subSchema = new Schema(subDef);
    return _.map(value, function(item) {
      return subSchema.sanitizeData({item: item}).item;
    });
  }
  else {
    return cast(property.type, value);
  }
};

function cast(Type, value) {
  if(value == null) {
    return null;
  }
  try {
    return new Type(value);
  }
  catch(error) {
    return value;
  }
};

function isObjectID(value) {
  return value instanceof ObjectID;
}

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
  return _.isFunction(value);
}

module.exports = Schema;

