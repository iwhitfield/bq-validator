module.exports = function(fields, onMissing) {
    return function(req, res, next){
        var missing = check(fields, req, res, {
            method: req.method == "POST" || req.method == "PUT" ? 'body' : 'query'
        });
        if(missing.length > 0)
            onMissing(missing.join('\n'), next);
        else
            next();
    }
}

function check(required, req, res, options){
    var newOpts,
        newMissing = [],
        missing = [],
        forcePass = false;

    for(var i in required){
        if(required[i] instanceof Array){
            newOpts = JSON.parse(JSON.stringify(options));
            newOpts.or = false;
            newMissing = check(required[i], req, res, newOpts);
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
                    newMissing = check(required[i][key], req, res, newOpts);
                } else if(key == "$body" || key == "$query"){
                    newOpts.method = key.slice(1);
                    newMissing = check(required[i][key], req, res, newOpts);
                } else if (key == '$number'){
                    if(isNaN(given)) {
                        delete req[options.method][value];
                        newMissing = [value + " must be a number."]
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