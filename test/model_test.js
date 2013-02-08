var Model = require('../lib/model');

describe('Model', function() {
  var Issue = Model.extend({
    properties: {
      name: String
    }
  });

  describe('set', function() {
    it('should not set undefined property', function() {
      var obj = new Issue();

      obj.set({foo: 'Foo'});

      assert.equal(undefined, obj.get('foo'));
    });

    it('should set defined property', function() {
      var obj = new Issue();

      obj.set({name: 'Foo'});

      assert.equal('Foo', obj.get('name'));
    });
  });
});
