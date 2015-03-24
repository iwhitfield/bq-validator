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
            assert.equal(missing, 'a must be given.');
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
            assert.equal(missing, 'a must be given.');
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
            assert.equal(missing, 'b must be given.')
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
            assert.equal(missing, 'b must be given.');
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
            assert.equal(missing, 'b must be given.\n' +
                'c must be given.');
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
            assert.equal(missing, 'b must be given.\n' +
                'c must be given.');
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
                "  a must be given.\n" +
                "  b must be given.\n" +
                "  c must be given.");
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
                num: "10.6"
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

    it("should verify field is an integer", function(next){
        var c = check([ { $int: 'num' } ], function(missing){
            assert.fail("Field was given as integer, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                num: "10"
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not an integer", function(next){
        var c = check([ { $int: 'num' } ], function(missing){
            assert.equal(missing, "num must be an integer.");
            next();
        })
        c({
            method: "GET",
            query: {
                num: "10.6"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to indentify field was not an integer."))
    });

    it("should verify field is a date", function(next){
        var c = check([ { $date: 'date' } ], function(missing){
            assert.fail("Field was given as date, but said to be missing");
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
        }, null, assert.fail.bind(null, "Failed to indentify field was not a date."))
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
        }, null, assert.fail.bind(null, "Failed to indentify field was not JSON."))
    });

    it("should verify field is a boolean", function(next){
        var c = check([ { $boolean: 'bool' } ], function(missing){
            assert.fail("Field was given as boolean, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                bool: "true"
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not a boolean", function(next){
        var c = check([ { $boolean: 'bool' } ], function(missing){
            assert.equal(missing, "bool must be true or false.");
            next();
        })
        c({
            method: "GET",
            query: {
                bool: "invalid"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to indentify field was not a boolean."))
    });

    it("should verify field is an email", function(next){
        var c = check([ { $email: 'email' } ], function(missing){
            assert.fail("Field was given as email, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                email: "robcatchpole@gmail.com"
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not an email", function(next){
        var c = check([ { $email: 'email' } ], function(missing){
            assert.equal(missing, "email must be a valid email address.");
            next();
        })
        c({
            method: "GET",
            query: {
                email: "invalid@address"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to indentify field was not an email."))
    });
})

describe("Validate custom validation", function(){
    it('should verify field value is a, b or c', function(next){
        var c = check([ { field: ['a', 'b', 'c'] } ], function(missing){
            assert.fail("Field was given as b, but said to be missing", missing);
        })
        c({
            method: "GET",
            query: {
                field: "b"
            },
            body: { }
        }, null, next)
    });

    it('should verify field value is not a, b or c', function(next){
        var c = check([ { field: ['a', 'b', 'c'] } ], function(missing){
            assert.equal(missing, "field must be one of following: a, b, c.");
            next();
        })
        c({
            method: "GET",
            query: {
                field: "invalid"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to identify invalid value."))
    });

    it('should verify field value valid using function', function(next){
        var c = check([{
            field: [function(value){
                if(value.substr(0, 3) == 'num' && !isNaN(value.substring(3, value.length)))
                    return Number(value.substring(0, value.length - 1));
            }]
        }], function(missing){
            assert.fail("Field was given as b, but said to be missing", missing);
        })
        c({
            method: "GET",
            query: {
                field: "num365"
            },
            body: { }
        }, null, next)
    });

    it('should verify field value invalid using function', function(next){
        var c = check([{
            field: [function(value){
                if(value.substr(0, 3) == 'num' && !isNaN(value.substring(3, value.length)))
                    return Number(value.substring(0, value.length - 1));
            }]
        }], function(missing){
            assert.equal("field must be valid format.", missing);
            next();
        })
        c({
            method: "GET",
            query: {
                field: "nah365"
            },
            body: { }
        }, null, assert.fail.bind(null, "Failed to identify invalid value."))
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

describe("Validate explicit method", function(next){
    it("should verify field is in query for get request", function(next){
        var c = check([ "field" ], "get", function(missing){
            assert.fail("Query field was given, but said to be missing");
        })
        c({
            method: "GET",
            query: {
                field: "test"
            },
            body: { }
        }, null, next)
    });

    it("should verify field is not in query for get request", function(next){
        var c = check([ "field" ], "get", function(missing){
            assert.equal("field must be given as query parameter.", missing);
            next()
        })
        c({
            method: "GET",
            query: { },
            body: { }
        }, null, assert.fail.bind(null, "Failed to identify missing parameter."))
    });

    it("should skip verification for delete request", function(next){
        var c = check([ "field" ], "delete", function(missing){
            assert.fail("Verification should have been skipped.");
        })
        c({
            method: "POST",
            query: { },
            body: { }
        }, null, next)
    });

    it("should skip verification for post request", function(next){
        var c = check([ "field" ], "get", function(missing){
            assert.fail("Verification should have been skipped.");
        })
        c({
            method: "POST",
            query: { },
            body: { }
        }, null, next)
    });

    it("should skip verification for post request", function(next){
        var c = check([ "field" ], "get", function(missing){
            assert.fail("Verification should have been skipped.");
        })
        c({
            method: "PUT",
            query: { },
            body: { }
        }, null, next)
    });

    it("should verify field is in body for post request", function(next){
        var c = check([ "field" ], "post", function(missing){
            assert.fail("Query field was given, but said to be missing");
        })
        c({
            method: "POST",
            body: {
                field: "test"
            },
            query: { }
        }, null, next)
    });

    it("should verify field is not in body for post request", function(next){
        var c = check([ "field" ], "post", function(missing){
            assert.equal("field must be given as body parameter.", missing);
            next()
        })
        c({
            method: "POST",
            query: { },
            body: { }
        }, null, assert.fail.bind(null, "Failed to identify missing parameter."))
    });

    it("should skip verification for delete request", function(next){
        var c = check([ "field" ], "post", function(missing){
            assert.fail("Verification should have been skipped.");
        })
        c({
            method: "DELETE",
            body: { },
            query: { }
        }, null, next)
    });

    it("should skip verification for get request", function(next){
        var c = check([ "field" ], "post", function(missing){
            assert.fail("Verification should have been skipped.");
        })
        c({
            method: "GET",
            body: { },
            query: { }
        }, null, next)
    });

    it("should skip verification for put request", function(next){
        var c = check([ "field" ], "post", function(missing){
            assert.fail("Verification should have been skipped.");
        })
        c({
            method: "PUT",
            query: { },
            body: { }
        }, null, next)
    });

})