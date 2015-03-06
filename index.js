module.exports = function(fields, onMissing) {
    return function(req, res, next){
        var missing = check(fields, req, {
            method: req.method == "POST" || req.method == "PUT" ? 'body' : 'query'
        });
        if(missing.length > 0)
            onMissing(missing.join('\n'), req, res, next);
        else
            next();
    }
}

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
            if(options.or && newMissing.length == 0)
                forcePass = true;
        } else if(typeof required[i] == 'object'){
            for(var key in required[i]){
                var value = required[i][key],
                    given = req[options.method][value];

                newOpts = JSON.parse(JSON.stringify(options));
                if(key == "$or" || key == '$and'){
                    newOpts.or = key == '$or';
                    newMissing = check(required[i][key], req, newOpts);
                } else if(key == "$body" || key == "$query"){
                    newOpts.method = key.slice(1);
                    newMissing = check(required[i][key], req, newOpts);
                } else if (key == '$number'){
                    if(isNaN(given)) {
                        delete req[options.method][value];
                        newMissing = [value + " must be a number."]
                    } else
                        req[options.method][value] = Number(value);
                } else if (key == '$int'){
                    if(isNaN(given) || given % 1 !== 0) {
                        delete req[options.method][value];
                        newMissing = [value + " must be an integer."]
                    } else
                        req[options.method][value] = Number(value);
                } else if(key == '$date') {
                    if(!isNaN(value)) given = Number(given);
                    var d = new Date(given);
                    if(d == "Invalid Date") {
                        delete req[options.method][value];
                        newMissing = [value + " must be a valid date."];
                    } else
                        req[options.method][value] = d;
                } else if(key == '$json'){
                    try {
                        given = JSON.parse(given);
                        req[options.method][value] = given;
                    } catch(err){
                        delete req[options.method][value];
                        newMissing = [value + " must be in JSON format."]
                    }
                } else if(key == '$boolean'){
                    if(given === 'true')
                        req[options.method][value] = true;
                    else if(given === 'false')
                        req[options.method][value] = false;
                    else {
                        newMissing = [value + " must be true or false."]
                        delete req[options.method][value]
                    }
                } else if(key == "$email") {
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if(!re.test(req[options.method][value])){
                        delete req[options.method][value];
                        newMissing = [value + " must be a valid email address."]
                    }
                }
                missing = missing.concat(newMissing);
                if(options.or && newMissing.length == 0)
                    forcePass = true;
            }
        } else if(typeof req[options.method][required[i]] == 'undefined') {
            missing.push(required[i] + " must be given as " + options.method + " parameter.");
        } else if(options.or)
            forcePass = true;
    }

    if(forcePass)
        return [];

    if(options.or){
        for(i in missing){
            missing[i] = '  ' + missing[i]
        }
        missing.unshift("At least one of the following.");
    }

    return missing;
}