var Schema = require('../lib/schema'),
    ObjectID = require('../lib/objectid');

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

    it('should cast string to ObjectID', function() {
      var schema = new Schema({attr: ObjectID});

      var result = schema.sanitizeData({attr: "507f1f77bcf86cd799439011"});

      assert(result.attr instanceof ObjectID);
    });

    it('should not cast illegal string to ObjectID', function() {
      var schema = new Schema({attr: ObjectID});

      var result = schema.sanitizeData({attr: "invalidobjectid"});

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

      var result = schema.sanitizeData({
        embeddedObject: {
          attr: "1",
          protectedAttr: "FOO"
        }
      });

      assert.deepEqual({"embeddedObject": {"attr": new Number(1)}}, result);
    });
  });

  describe('validate', function() {
    describe('String', function() {
      var schema = new Schema({
        attr: String
      });

      it('should not fail if attr is String', function(done) {
        schema.validate({attr: ""}, function(err) {
          assert(err === null);
          done();
        })
      });

      it('should not fail if attr is null', function(done) {
        schema.validate({attr: null}, function(err) {
          assert(err === null);
          done();
        })
      });

      it('should fail if attr is not String', function(done) {
        schema.validate({attr: 1}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not a String");
          done();
        })
      });
    });

    describe('Number', function() {
      var schema = new Schema({
        attr: Number
      });

      it('should not fail if attr is Number', function(done) {
        schema.validate({attr: 1}, function(err) {
          assert(err == null);
          done();
        });
      });

      it('should fail if attr is not Number', function(done) {
        schema.validate({attr: "XXX"}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not a Number");
          done();
        });
      });
 
      it('should fail if attr is NaN', function(done) {
        schema.validate({attr: new Number("XXX")}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not a Number");
          done();
        });
      });
    });

    describe('Date', function() {
      var schema = new Schema({
        attr: Date
      });

      it('should not fail if attr is Date', function(done) {
        schema.validate({attr: new Date}, function(err) {
          assert(err == null);
          done();
        });
      });

      it('should fail if attr is not Date', function(done) {
        schema.validate({attr: "2012-01-01T10:00:00Z"}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not a Date");
          done();
        });
      });
 
      it('should fail if attr is invalid Date', function(done) {
        schema.validate({attr: new Date("XXX")}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not a Date");
          done();
        });
      });
    });

    describe('Boolean', function() {
      var schema = new Schema({
        attr: Boolean
      });

      it('should not fail if attr is Boolean', function(done) {
        schema.validate({attr: true}, function(err) {
          assert(err == null);
          done();
        });
      });

      it('should fail if attr is not Boolean', function(done) {
        schema.validate({attr: "true"}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not a Boolean");
          done();
        });
      });
    });

    describe('ObjectID', function() {
      var schema = new Schema({
        attr: ObjectID
      });

      it('should not fail if attr is ObjectID', function(done) {
        schema.validate({attr: new ObjectID()}, function(err) {
          assert(err == null);
          done();
        });
      });

      it('should fail if attr is not ObjectID', function(done) {
        schema.validate({attr: "511a924001e62bdc56000001"}, function(err) {
          assert(err);
          assert.equal(err.errors.attr, "is not an ObjectID");
          done();
        });
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

      it('should validate embedded properties', function(done) {
        schema.validate({embeddedObject: {attr: "FOO"}}, function(err) {
          assert(err);
          assert.deepEqual({errors: {embeddedObject: {attr: "is not a Number"}}}, err);
          done();
        });
      });
    });
  });
});
