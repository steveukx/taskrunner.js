
var TaskRunner = require('../lib/taskrunner').TaskRunner,
    Task = require('../lib/taskrunner').Task,

    equals = require('assert').equal;

TaskRunner.scheduleNextOperation = function(fn) { fn() };

var a, b, c, d;

var taskRunner = new TaskRunner();
taskRunner.push(new Task(function(next) {
   a = 1;
}, 'MyTask-a', false));
taskRunner.push(new Task(function(next) {
   b = a + a; next();
}, 'My Async Task'));
taskRunner.push(new Task(function(next) {
   c = b + b;
}, 'MyTask-b', false));

taskRunner.start(function() {
   equals(a, 1);
   equals(b, 2);
   equals(c, 4);

   d = true;
});

equals(d, true);
