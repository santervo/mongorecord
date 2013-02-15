var mongorecord = require('../');

describe('Model', function() {

  //mongorecord.connect("http://localhost/mongorecord_test");

  var User = mongorecord.defineModel({
    properties: {
      name: String,
      birthDate: Date,
      updatedAt: {
        type: Date,
        protected: true
      }
    }
  });

  describe('set', function() {
    it('should sanitize data', function() {
      var obj = new User();

      obj.set({
        name: 'John Doe',
        password: 'secret',
        birthDate: '1980-05-01T10:00:01Z',
        updated_at: '2012-01-01T12:00:00Z'
      });

      assert.equal('John Doe', obj.get('name'));
      assert.equal(undefined, obj.get('password'));
      assert.equal(new Date('1980-05-01T10:00:01Z').getTime(), obj.get('birthDate').getTime());
      assert.equal(undefined, obj.get('updatedAt'));
    });
  });
});
