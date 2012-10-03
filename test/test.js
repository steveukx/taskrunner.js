
var tests = require('unit-test'),
    Suite = tests.Suite,
    testPath = (/test.js$/.test(process.argv[1])) ? String(process.argv[1]).replace(/test.js$/, '') : process.cwd();


Suite.paths( testPath, ['test-*.js'] );



