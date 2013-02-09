var Model = require('../lib/model');

describe('Model', function() {
  var Issue = Model.extend({
    properties: {
      title: String,
      updated_at: {
        type: Date,
        protected: true
      }
    }
  });

  describe('set', function() {
    it('should not set undefined property', function() {
      var obj = new Issue();

      obj.set({foo: 'Foo'});

      assert.equal(undefined, obj.get('foo'));
    });

    it('should not set protected property', function() {
      var obj = new Issue();

      obj.set({updated_at: new Date});

      assert.equal(undefined, obj.get('updated_at'));
    });

    it('should set defined property', function() {
      var obj = new Issue();

      obj.set({title: 'Foo'});

      assert.equal('Foo', obj.get('title'));
    });
  });
});
