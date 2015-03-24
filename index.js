module.exports = function(fields, method, onMissing) {
    if(arguments.length === 2) {
        onMissing = method;
        method = null;
    } else
        method = method.toLowerCase();
    return function(req, res, next){
        var defMethod = false;
        if(method && req.method.toLowerCase() !== method)
            return next();
        else if(!method){
            method = req.method.toLowerCase();
            defMethod = true;
        }
        var missing = check(fields, req, {
            method: method === "post" || method === "put" ? "body" : "query",
            defaultMethod: defMethod
        });
        if(missing.length > 0)
            onMissing(missing.join("\n"), req, res, next);
        else
            next();
    };
};

function check(required, req, options){
    var newOpts,
        newMissing = [],
        missing = [],
        forcePass = false;

    for(var i in required){
        if(required[i] instanceof Array){
            newOpts = JSON.parse(JSON.stringify(options));
            newOpts.or = false;
            newMissing = check(required[i], req, newOpts);
            missing = missing.concat(newMissing);
            if(options.or && newMissing.length === 0)
                forcePass = true;
        } else if(typeof required[i] === "object"){
            for(var key in required[i]){
                newMissing = [];
                var value = required[i][key],
                    given = req[options.method][value];

                newOpts = JSON.parse(JSON.stringify(options));
                if(key === "$or" || key === "$and"){
                    newOpts.or = key === "$or";
                    newMissing = check(value, req, newOpts);
                } else if(key === "$body" || key === "$query"){
                    newOpts.method = key.slice(1);
                    newOpts.defaultMethod = false;
                    newMissing = check(value, req, newOpts);
                } else if(operators[key]){
                    if(value instanceof Array) {
                        for(var j in value)
                            newMissing = newMissing.concat(operators[key](req, req[options.method][value[j]], value[j], options) || []);
                    } else
                        newMissing = operators[key](req, given, value, options) || [];
                } else if(value instanceof Array){
                    given = req[options.method][key];
                    if(given === undefined){
                        newMissing = [key + " must be given."];
                    } else {
                        var passed = false,
                            hasFunction = false;
                        for (var x in value) {
                            if (typeof value[x] === "function") {
                                hasFunction = true;
                                var v = value[x](given, req);
                                if (v !== undefined) {
                                    req[options.method][value] = v;
                                    passed = true;
                                    break;
                                }
                            } else {
                                if(given === value[x]){
                                    passed = true;
                                    break;
                                }
                            }
                        }
                        if(!passed){
                            delete req[options.method][value];
                            newMissing = [hasFunction ? key + " must be valid format."
                                : key + " must be one of following: " + value.join(", ") + "."];
                        }
                    }
                }

                missing = missing.concat(newMissing);
                if((options.or || newOpts.or) && newMissing.length === 0)
                    forcePass = true;
            }
        } else if(typeof req[options.method][required[i]] === "undefined") {
            missing.push(required[i] + " must be given" +
                (options.defaultMethod ? "." : " as " + options.method + " parameter."));
        } else if(options.or)
            forcePass = true;
    }

    if(forcePass)
        return [];

    if(options.or){
        for(i in missing){
            missing[i] = "  " + missing[i];
        }
        missing.unshift("At least one of the following.");
    }

    return missing;
}

var operators = {
    $number: function(req, given, value, options) {
        if (isNaN(given)) {
            delete req[options.method][value];
            return [value + " must be a number."];
        } else
            req[options.method][value] = Number(given);
    },
    $int: function(req, given, value, options){
        if(isNaN(given) || given % 1 !== 0) {
            delete req[options.method][value];
            return [value + " must be an integer."];
        } else
            req[options.method][value] = Number(given);
    },
    $date: function(req, given, value, options){
        if(!isNaN(value)) given = Number(given);
        var d = new Date(given);
        if(d.toString() === "Invalid Date") {
            delete req[options.method][value];
            return [value + " must be a valid date."];
        } else
            req[options.method][value] = d;
    },
    $json: function(req, given, value, options){
        try {
            given = JSON.parse(given);
            req[options.method][value] = given;
        } catch(err){
            delete req[options.method][value];
            return [value + " must be in JSON format."];
        }
    },
    $boolean: function(req, given, value, options){
        if(given === "true")
            req[options.method][value] = true;
        else if(given === "false")
            req[options.method][value] = false;
        else {
            delete req[options.method][value];
            return [value + " must be true or false."];
        }
    },
    $email: function(req, given, value, options){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(given)){
            delete req[options.method][value];
            return [value + " must be a valid email address."];
        }
    }
};