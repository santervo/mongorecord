var recs = require("../");

describe("Recs", function() {
  var Project = null;

    it("should not merge undefined property", function() {
      var Coll = new recs.Collection({properties: {}});
      var obj = Coll.build();

      obj.merge({name: "Foo"});

      assert.equal(undefined, obj.name);
    });
    it("should merge defined property", function() {
      var Coll = new recs.Collection({properties: {name: String}});
      var obj = Coll.build();

      obj.merge({name: "Foo"});

      assert.equal("Foo", obj.name);
    });
});
