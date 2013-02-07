var _ = require('underscore');

var RecordPrototype = function(constructor, collection) { 
  this.constructor = constructor;
  this.collection = collection;
};

RecordPrototype.prototype.merge = function(attrs) {
  attrs = _.pick(attrs, this.collection.massAssignableProperties());
  _.extend(this, attrs);
};

module.exports = RecordPrototype;
