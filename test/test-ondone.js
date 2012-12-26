
var TestCase = require('unit-test').TestCase,
   Assertions = require('unit-test').Assertions,
   sinon = require('unit-test').Sinon;

module.exports = new TestCase('OnDone', function() {

   var taskRunner, taskRunnerScheduleNextOperation;
   var TaskRunner = require('../lib/taskrunner');
   var Task = require('../lib/task');

   return {
      setUp: function() {
         taskRunnerScheduleNextOperation = TaskRunner.scheduleNextOperation;
         TaskRunner.scheduleNextOperation = function(fn) { fn() };
      },
      tearDown: function() {
         taskRunner = null;
         TaskRunner.scheduleNextOperation = taskRunnerScheduleNextOperation;
      },
      "test Completion handler called after all tasks are done": function() {
         var a = sinon.spy(),
            b = sinon.spy(function(next) {next();}),
            c = sinon.spy(),
            onDone = sinon.spy();

         taskRunner = new TaskRunner();
         taskRunner.push(new Task(a, 'MyTask-a', false));
         taskRunner.push(new Task(b, 'My Async Task'));
         taskRunner.push(new Task(c, 'MyTask-b', false));
         taskRunner.start(onDone);

         Assertions.assert(a.calledOnce);
         Assertions.assert(b.calledOnce);
         Assertions.assert(c.calledOnce);

         Assertions.assert(a.calledBefore(b));
         Assertions.assert(b.calledBefore(c));

         Assertions.assert(onDone.calledOnce);
         Assertions.assert(onDone.calledAfter(c));
      }
   }

});

