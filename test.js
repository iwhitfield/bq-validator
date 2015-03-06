var Mocha = require('mocha');

var mocha = new Mocha({
    ui: 'bdd'
})

mocha.addFile(__dirname + '/test/test.js');

mocha.run(function(failures){
    process.exit(failures);
})