
var TaskRunner = require('../lib/taskrunner').TaskRunner,
    Task = require('../lib/taskrunner').Task,

    equals = require('assert').equal;

TaskRunner.scheduleNextOperation = function(fn) { fn() };

var a, b, c;

var taskRunner = new TaskRunner();
taskRunner.push(function(next) {
   a = 1;
}, '', false);
taskRunner.push(function(next) {
   b = a + a; next();
});
taskRunner.push(function(next) {
   c = b + b;
}, '', false);

taskRunner.start();

equals(a, 1);
equals(b, 2);
equals(c, 4);
