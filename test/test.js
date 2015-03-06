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
            if(missing == 'a must be given as query parameter.')
                next();
            else
                assert.fail("One field missing, but missing is " + JSON.stringify(missing, null, 2));
        });
        c({
            method: "GET",
            query: { },
            body: { }
        }, null, assert.fail.bind(null, "Field was not identified as missing"));
    });

    it('should verify a body parameter is not given', function (next) {
        var c = check(['a'], function (missing) {
            if(missing == 'a must be given as body parameter.')
                next();
            else
                assert.fail("One field missing, but missing is " + JSON.stringify(missing, null, 2));
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
            should.fail("All fields were given, but missing fields said to occur.");
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
    })

    it('should verify all body parameters given', function(next){
        var c = check(['a', 'b', 'c'], function(missing){
            should.fail("All fields were given, but missing fields said to occur.");
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
    })
})