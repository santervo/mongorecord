var _ = require('underscore'),
    RecordPrototype = require('./record-prototype');

var Collection = function(attrs) {
  attrs = attrs || {};
  _.extend(this, attrs);

  this.Record = function(attrs) {
    if(attrs) {
      this.merge(attrs);
    }
  };

  this.Record.prototype = new RecordPrototype(this.Record, this);
}

Collection.prototype.build = function(attrs) {
  return new this.Record(attrs);
};

Collection.prototype.massAssignableProperties = function() {
  return _.keys(this.properties);
};

module.exports = Collection;
