var Schema = require('../lib/schema');

describe('Schema', function() {

  describe('sanitizeData', function() {

    it('should remove undefined property', function() {
      var schema = new Schema({});

      var result = schema.sanitizeData({attr: "Foo"});

      assert.equal(undefined, result.attr);
    });

    it('should remove protected property', function() {
      var schema = new Schema({attr: {type: String, protected: true}});

      var result = schema.sanitizeData({attr: "Foo"});

      assert.equal(undefined, result.attr);
    });

    it('should include unprotected property', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitizeData({attr: "Foo"});

      assert.equal("Foo", result.attr);
    });

    it('should not cast null to String', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitizeData({attr: null});

      assert.equal(null, result.attr);
    });

    it('should not cast empty string to null', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitizeData({attr: ""});

      assert.equal("", result.attr);
    });

    it('should cast number to String', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitizeData({attr: 1});

      assert.equal("1", result.attr);
    });

    it('should cast iso date string to Date', function() {
      var schema = new Schema({attr: Date});

      var result = schema.sanitizeData({attr: "2012-01-01T10:00:00Z"});

      assert(result.attr instanceof Date);
      assert.equal(new Date('2012-01-01T10:00:00Z').getTime(), result.attr.getTime());
    });

    it('should cast string to Number', function() {
      var schema = new Schema({attr: Number});

      var result = schema.sanitizeData({attr: "123.45"});

      assert.equal(123.45, result.attr);
    });

  })
});
