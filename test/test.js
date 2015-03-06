var check = require('../index.js'),
    assert = require('assert');

describe('Validate singe field', function() {
    it('should verify a query parameter is given', function (next) {
        var c = check(['a'], function (missing) {
            assert.fail("Field was given, but missing fields said to occur.");
        });
        c({
            method: "GET",
            query: {
                a: 'test'
            },
            body: { }
        }, null, next);
    });

    it('should verify a body parameter is given', function (next) {
        var c = check(['a'], function (missing) {
            assert.fail("Field was given, but missing fields said to occur.");
        });
        c({
            method: "POST",
            body: {
                a: 'test'
            },
            query: { }
        }, null, next);
    });

    it('should verify a query parameter is not given', function (next) {
        var c = check(['a'], function (missing) {
            assert.equal(missing, 'a must be given as query parameter.');
            next();
        });
        c({
            method: "GET",
            query: { },
            body: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });

    it('should verify a body parameter is not given', function (next) {
        var c = check(['a'], function (missing) {
            assert.equal(missing, 'a must be given as body parameter.');
            next();
        });
        c({
            method: "POST",
            query: { },
            body: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });
})

describe("Validate multiple required fields", function(){
    it('should verify all query parameters given', function(next){
        var c = check(['a', 'b', 'c'], function(missing){
            assert.fail("All fields were given, but missing fields said to occur.");
        })
        c({
            method: 'GET',
            query: {
                a: 'test',
                b: 'test',
                c: 'test'
            },
            body: { }
        }, null, next)
    });

    it('should verify all body parameters given', function(next){
        var c = check(['a', 'b', 'c'], function(missing){
            assert.fail("All fields were given, but missing fields said to occur.");
        })
        c({
            method: 'POST',
            body: {
                a: 'test',
                b: 'test',
                c: 'test'
            },
            query: { }
        }, null, next)
    });

    it('should verify a query parameter is not given', function (next) {
        var c = check(['a', 'b', 'c'], function (missing) {
            assert.equal(missing, 'b must be given as query parameter.')
            next();
        });
        c({
            method: "GET",
            query: {
                a: 'test',
                c: 'test'
            },
            body: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });

    it('should verify a query parameter is not given', function (next) {
        var c = check(['a', 'b', 'c'], function (missing) {
            assert.equal(missing, 'b must be given as body parameter.');
            next();
        });
        c({
            method: "POST",
            body: {
                a: 'test',
                c: 'test'
            },
            query: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });

    it('should verify multiple query parameters are not given', function (next) {
        var c = check(['a', 'b', 'c'], function (missing) {
            assert.equal(missing, 'b must be given as query parameter.\n' +
                'c must be given as query parameter.');
            next();
        });
        c({
            method: "GET",
            query: {
                a: 'test'
            },
            body: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });

    it('should verify multiple body parameters are not given', function (next) {
        var c = check(['a', 'b', 'c'], function (missing) {
            assert.equal(missing, 'b must be given as body parameter.\n' +
                'c must be given as body parameter.');
            next();
        });
        c({
            method: "POST",
            body: {
                a: 'test'
            },
            query: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });
})

describe("Validate $or with multiple fields", function(){
    it("should verify when all fields are given", function(next){
        var c = check([{ $or: ['a', 'b', 'c']}], function(missing){
            assert.fail("All fields were given, but missing fields said to occur.");
        })
        c({
            method: 'POST',
            body: {
                a: 'test',
                b: 'test',
                c: 'test'
            },
            query: { }
        }, null, next)
    });

    it("should verify when at least one field is given", function(next){
        var c = check([{ $or: ['a', 'b', 'c']}], function(missing){
            assert.fail("A field was given, but missing fields said to occur.", missing);
        })
        c({
            method: 'POST',
            body: {
                a: 'test'
            },
            query: { }
        }, null, next)
    });

    it("should verify all fields are missing", function(next){
        var c = check([{ $or: ['a', 'b', 'c']}], function(missing){
            assert.equal(missing, "At least one of the following.\n" +
                "  a must be given as body parameter.\n" +
                "  b must be given as body parameter.\n" +
                "  c must be given as body parameter.");
            next();
        })
        c({
            method: 'POST',
            body: {

            },
            query: { }
        }, null, assert.fail.bind(null, "Fields were not identified as missing"))
    });
})

describe("Validate correct datatype", function(){
    it("should verify field is a number", function(next){
        var c = check([ { $number: 'num' } ], function(missing){
            assert.fail("Field was given as number, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                num: "10"
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not a number", function(next){
        var c = check([ { $number: 'num' } ], function(missing){
            assert.equal(missing, "num must be a number.");
            next();
        })
        c({
            method: "GET",
            query: {
                num: "fail"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to indentify field was not a number."))
    });

    it("should verify field is a date", function(next){
        var c = check([ { $date: 'date' } ], function(missing){
            assert.fail("Field was given as number, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                date: new Date().toString()
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not a date", function(next){
        var c = check([ { $date: 'date' } ], function(missing){
            assert.equal(missing, "date must be a valid date.");
            next();
        })
        c({
            method: "GET",
            query: {
                date: "fail"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to indentify field was not a number."))
    });

    it("should verify field is JSON", function(next){
        var c = check([ { $json: 'json' } ], function(missing){
            assert.fail("Field was given as JSON, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                json: JSON.stringify({
                    a: 5,
                    b: 10
                })
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not JSON", function(next){
        var c = check([ { $json: 'json' } ], function(missing){
            assert.equal(missing, "json must be in JSON format.");
            next();
        })
        c({
            method: "GET",
            query: {
                json: "{ invalid, json }"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to indentify field was not a number."))
    });
})

describe("Validate $query and $body", function(){
    it("should verify $query field is in POST request", function(next){
        var c = check([ { $query: 'q' } ], function(missing){
            assert.fail("Query field was given, but said to be missing");
        })
        c({
            method: "POST",
            query: {
                q: "test"
            },
            body: { }
        }, null, next)
    });

    it("should verify $body is in POST request", function(next){
        var c = check([ { $body: 'q' } ], function(missing){
            assert.fail("Query field was given, but said to be missing");
        })
        c({
            method: "POST",
            body: {
                q: "test"
            },
            query: { }
        }, null, next)
    });
})