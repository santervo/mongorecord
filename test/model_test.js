var Model = require("../lib/model");

describe("Model", function() {
  var Issue = Model.extend({
    properties: {
      name: String
    }
  });

  describe("merge", function() {
    it("should not merge undefined property", function() {
      var obj = new Issue();

      obj.merge({foo: "Foo"});

      assert.equal(undefined, obj.foo);
    });

    it("should merge defined property", function() {
      var obj = new Issue();

      obj.merge({name: "Foo"});

      assert.equal("Foo", obj.name);
    });
  });
});
