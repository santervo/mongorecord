var Model = require('../lib/model');

describe('Model', function() {
  var Issue = Model.define({
    title: String,
    scheduled_date: Date,
    updated_at: {
      type: Date,
      protected: true
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

    it('should cast string to date', function() {
      var obj = new Issue();

      obj.set({scheduled_date: '2013-02-09T17:16:03.860Z'});

      assert(obj.get('scheduled_date') instanceof Date);
      assert.equal(new Date('2013-02-09T17:16:03.860Z').getTime(), obj.get('scheduled_date').getTime());
    });
  });
});
