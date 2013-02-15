var Schema = require('../lib/schema'),
    ObjectID = require('../lib/objectid');

describe('Schema', function() {

  describe('sanitize', function() {
    it('should remove undefined property', function() {
      var schema = new Schema({});

      var result = schema.sanitize({attr: "Foo"});

      assert.equal(undefined, result.attr);
    });

    it('should remove protected property', function() {
      var schema = new Schema({attr: {type: String, protected: true}});

      var result = schema.sanitize({attr: "Foo"});

      assert.equal(undefined, result.attr);
    });

    it('should include unprotected property', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitize({attr: "Foo"});

      assert.equal("Foo", result.attr);
    });

    it('should not cast null to String', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitize({attr: null});

      assert.equal(null, result.attr);
    });

    it('should not cast empty string to null', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitize({attr: ""});

      assert.equal("", result.attr);
    });

    it('should cast number to String', function() {
      var schema = new Schema({attr: String});

      var result = schema.sanitize({attr: 1});

      assert.equal("1", result.attr);
    });

    it('should cast iso date string to Date', function() {
      var schema = new Schema({attr: Date});

      var result = schema.sanitize({attr: "2012-01-01T10:00:00Z"});

      assert(result.attr instanceof Date);
      assert.equal(new Date('2012-01-01T10:00:00Z').getTime(), result.attr.getTime());
    });

    it('should cast string to Number', function() {
      var schema = new Schema({attr: Number});

      var result = schema.sanitize({attr: "123.45"});

      assert.equal(123.45, result.attr);
    });

    it('should cast string to ObjectID', function() {
      var schema = new Schema({attr: ObjectID});

      var result = schema.sanitize({attr: "507f1f77bcf86cd799439011"});

      assert(result.attr instanceof ObjectID);
    });

    it('should not cast illegal string to ObjectID', function() {
      var schema = new Schema({attr: ObjectID});

      var result = schema.sanitize({attr: "invalidobjectid"});

      assert.equal("invalidobjectid", result.attr);
    });

    it('should sanitize embedded Object', function() {
      var schema = new Schema({
        embeddedObject: {
          type: Object,
          properties: {
            attr: Number,
          protectedAttr: { type: String, protected: true }
          }
        }
      });

      var result = schema.sanitize({
        embeddedObject: {
          attr: "1",
          protectedAttr: "FOO"
        }
      });

      assert.deepEqual({"embeddedObject": {"attr": new Number(1)}}, result);
    });

    it('should sanitize Array of embedded Strings', function() {
      var schema = new Schema({
        arr: {
          type: Array,
          item_type: String
        }
      });

      var result = schema.sanitize({arr: [1, "BAR"]});

      assert.deepEqual({arr: [new String("1"), new String("BAR")]}, result);
    });

    it('should sanitize Array of embedded Objects', function() {
      var schema = new Schema({
        arr: {
          type: Array,
          item_type: Object,
          item_properties: {
            attr: Number,
          protectedAttr: { type: String, protected: true }
          }
        }
      });

      var result = schema.sanitize({
        arr: [{
          attr: "1",
          protectedAttr: "FOO"
        }]
      });

      assert.deepEqual({arr: [{"attr": new Number(1)}]}, result);
    });
  });

  describe('validate', function() {
    describe('String', function() {
      var schema = new Schema({
        attr: String
      });

      it('should not fail if attr is String', function() {
        var err = schema.validate({attr: ""});
        assert(err === null);
      });

      it('should not fail if attr is null', function() {
        var err = schema.validate({attr: null});
        assert(err === null);
      });

      it('should fail if attr is not String', function() {
        var err = schema.validate({attr: 1});
        assert(err);
        assert.equal(err.errors.attr, "is not a String");
      });
    });

    describe('Number', function() {
      var schema = new Schema({
        attr: Number
      });

      it('should not fail if attr is Number', function() {
        var err = schema.validate({attr: 1});
        assert(err == null);
      });

      it('should fail if attr is not Number', function() {
        var err = schema.validate({attr: "XXX"});
        assert(err);
        assert.equal(err.errors.attr, "is not a Number");
      });

      it('should fail if attr is NaN', function() {
        var err = schema.validate({attr: new Number("XXX")});
        assert(err);
        assert.equal(err.errors.attr, "is not a Number");
      });
    });

    describe('Date', function() {
      var schema = new Schema({
        attr: Date
      });

      it('should not fail if attr is Date', function() {
        var err = schema.validate({attr: new Date});
        assert(err == null);
      });

      it('should fail if attr is not Date', function() {
        var err = schema.validate({attr: "2012-01-01T10:00:00Z"});
        assert(err);
        assert.equal(err.errors.attr, "is not a Date");
      });

      it('should fail if attr is invalid Date', function() {
        var err = schema.validate({attr: new Date("XXX")});
        assert(err);
        assert.equal(err.errors.attr, "is not a Date");
      });
    });

    describe('Boolean', function() {
      var schema = new Schema({
        attr: Boolean
      });

      it('should not fail if attr is Boolean', function() {
        var err = schema.validate({attr: true});
        assert(err == null);
      });

      it('should fail if attr is not Boolean', function() {
        var err = schema.validate({attr: "true"});
        assert(err);
        assert.equal(err.errors.attr, "is not a Boolean");
      });
    });

    describe('ObjectID', function() {
      var schema = new Schema({
        attr: ObjectID
      });

      it('should not fail if attr is ObjectID', function() {
        var err = schema.validate({attr: new ObjectID()});
        assert(err == null);
      });

      it('should fail if attr is not ObjectID', function() {
        var err = schema.validate({attr: "511a924001e62bdc56000001"});
        assert(err);
        assert.equal(err.errors.attr, "is not an ObjectID");
      });
    });

    describe('Object', function() {
      var schema = new Schema({
        embeddedObject: {
          type: Object,
          properties: {
            attr: Number
          }
        }
      });

      it('should include errors for embedded properties', function() {
        var err = schema.validate({embeddedObject: {attr: "FOO"}});
        assert(err);
        assert.deepEqual({errors: {embeddedObject: {attr: "is not a Number"}}}, err);
      });

      it('should not include errors for valid embedded Object', function() {
        var err = schema.validate({embeddedObject: {attr: 1}});
        assert(!err);
      });
    });

    describe('Array', function() {
      var schema = new Schema({
        arr: {
          type: Array,
          item_type: Object,
          item_properties: {
            attr: Number
          }
        }
      });

      it('should validate contained objects', function() {
        var err = schema.validate({arr: [{attr: 1},{attr: "FOO"}]});
        assert.deepEqual({errors: {arr: {1: {attr: "is not a Number"}}}}, err);
      });

      it('should not include errors for valid contained objects', function() {
        var err = schema.validate({arr: [{attr: 1},{attr: 2.5}]});
        assert(!err);
      });
    });
  });
});
