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
    it('should sanitize data', function() {
      var obj = new Issue();

      obj.set({
        title: 'Bar',
        foo: 'Foo',
        scheduled_date: '2012-01-01T10:00:00Z',
        updated_at: '2012-01-01T10:00:00Z'
      });

      assert.equal('Bar', obj.get('title'));
      assert.equal(undefined, obj.get('foo'));
      assert.equal(new Date('2012-01-01T10:00:00Z').getTime(), obj.get('scheduled_date').getTime());
      assert.equal(undefined, obj.get('updated_at'));
    });
  });
});
