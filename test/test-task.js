
var TestCase = require('unit-test').TestCase,
   Assertions = require('unit-test').Assertions,
   sinon = require('unit-test').Sinon;

module.exports = new TestCase('Tasks', function() {

   var taskRunner, taskRunnerScheduleNextOperation;
   var TaskRunner = require('../lib/taskrunner');
   var Task = require('../lib/task');

   return {
      setUp: function() {
         taskRunnerScheduleNextOperation = TaskRunner.scheduleNextOperation;
         TaskRunner.scheduleNextOperation = function(fn) { fn() };
         taskRunner = new TaskRunner;
      },
      tearDown: function() {
         taskRunner = null;
         TaskRunner.scheduleNextOperation = taskRunnerScheduleNextOperation;
      },
      "test Can add tasks to a task runner": function() {
         var a, b, c;
         var taskA = new Task(a = sinon.spy(), 'a', false),
             taskB = new Task(b = sinon.spy(function(next) { next(); }), 'b'),
             taskC = new Task(c = sinon.spy(), 'c', false);

         taskRunner.push(taskA);
         taskRunner.push(taskB);
         taskRunner.push(taskC);
         taskRunner.start();

         Assertions.assert(a.calledOnce, 'Called first task')
                   .assert(b.calledOnce, 'Called second task')
                   .assert(c.calledOnce, 'Called third task');

         Assertions.assert(a.calledBefore(b), 'Called A before other tasks')
                   .assert(b.calledBefore(c), 'Called B before other tasks, but after A');
      },

      "test Can reverse order of arguments": function() {
         taskRunner.sync("a", function (next) {
            next(null, "A")
         });
         taskRunner.sync(function (next) {
            next(null, "B")
         }, "b");
         taskRunner.start();

         Assertions.assertSame({"a": "A", "b": "B"}, taskRunner.result(), "Results should be stored for each task");
      }
   }

});


