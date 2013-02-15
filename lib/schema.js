var _ = require('underscore'),
    ObjectID = require('./objectid');

var Schema = function(propertyDefs) {
  this.properties = buildProperties(propertyDefs);
};

function buildProperties(propertyDefs) {
  return _.reduce(propertyDefs, function(properties, def, key) {
    properties[key] = buildProperty(def);
    return properties;
  }, {});
};

function buildProperty(def) {
    def = normalizePropertyDef(def);
    if(def.type === Object) return new ObjectProperty(def);
    if(def.type === Array) return new ArrayProperty(def);
    if(def.type === String) return new StringProperty(def);
    if(def.type === Number) return new NumberProperty(def);
    if(def.type === Date) return new DateProperty(def);
    if(def.type === Boolean) return new BooleanProperty(def);
    if(def.type === ObjectID) return new ObjectIDProperty(def);
    throw "Unknown type";
};
 
function normalizePropertyDef(def) {
  return _.isFunction(def) ? {type: def} : def;
};

Schema.prototype.sanitizeData = function(attrs) {
  return _.reduce(attrs, this.sanitizeProperty, {}, this);
};

Schema.prototype.sanitizeProperty = function(attrs, value, key) {
  var property = this.properties[key];

  // protect from mass assignment
  if(!property || property.protected) {
    return attrs;
  }

  // perform type casting and sanitizing of embedded documents
  attrs[key] = property.sanitize(value);
  return attrs;
};

Schema.prototype.validate = function(attrs, done) {
  var errors = this._validate(attrs);
  return _.isEmpty(errors) ? null : {errors: errors};
};

Schema.prototype._validate = function(attrs) {
  return _.reduce(attrs, this.validateAttr, {}, this);
}

Schema.prototype.validateAttr = function(errors, value, key) {
  var property = this.properties[key];
  if(value != null) {
    var error = property.validate(value);
    if(error) {
      errors[key] = error;
    }
  }
  return errors;
};

/*
 * Property Constructors
 */

var Base = function() {};

Base.extend = require('./utils').extend;

var Property = Base.extend({
  constructor: function(propertyDef) {
    _.extend(this, propertyDef);
  },
  sanitize: function(value) {
    return cast(this.type, value);
  },
  validate: function(value) {}
});

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

var ObjectProperty = Property.extend({
  constructor: function() {
    Property.prototype.constructor.apply(this, arguments);
    this.subSchema = new Schema(this.properties);
  },
  sanitize: function(value) {
    return this.subSchema.sanitizeData(value);
  },
  validate: function(value) {
    var embeddedErrors = this.subSchema._validate(value);
    if(!_.isEmpty(embeddedErrors)) {
      return embeddedErrors;
    }
  }
});

var ArrayProperty = Property.extend({
  constructor: function() {
    Property.prototype.constructor.apply(this, arguments);
    this.subSchema = new Schema({ 
      item: { 
        type: this.item_type,
        properties: this.item_properties
      }
    });
  },
  sanitize: function(value) {
    return _.map(value, function(item) {
      return this.subSchema.sanitizeData({item: item}).item;
    }, this);
  },
  validate: function(value) {
    var errors = {};
    _.each(value, function(value, index) {
      var itemErrors = this.subSchema._validate({item: value});
      if(!_.isEmpty(itemErrors)) {
        errors[index] = itemErrors.item;
      }
    }, this);
    if(!_.isEmpty(errors)) {
      return errors;
    }
  }
});

var StringProperty = Property.extend({
  validate: function(value) {
    if(!_.isString(value)) {
      return "is not a String";
    }
  }
});

var NumberProperty = Property.extend({
  validate: function(value) {
    if(!_.isNumber(value) || _.isNaN(value)) {
      return "is not a Number";
    }
  }
});

var DateProperty = Property.extend({
  validate: function(value) {
    if(!_.isDate(value) || _.isNaN(value.getTime())) {
      return "is not a Date";
    }
  }
});

var BooleanProperty = Property.extend({
  validate: function(value) {
    if(!_.isBoolean(value)) {
      return "is not a Boolean";
    }
  }
});

var ObjectIDProperty = Property.extend({
  validate: function(value) {
    if(!isObjectID(value)) {
      return "is not an ObjectID";
    }
  }
});

function isObjectID(value) {
  return value instanceof ObjectID;
}

module.exports = Schema;

