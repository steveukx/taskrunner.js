
var TestCase = require('unit-test').TestCase,
    Assertions = require('unit-test').Assertions,
    sinon = require('unit-test').Sinon;

module.exports = new TestCase('Errors', function() {

   var taskRunner, taskRunnerScheduleNextOperation;
   var TaskRunner = require('../lib/taskrunner');
   var errorSpy;

   return {
      setUp: function() {
         taskRunnerScheduleNextOperation = TaskRunner.scheduleNextOperation;
         TaskRunner.scheduleNextOperation = function(fn) { fn() };
         taskRunner = new TaskRunner;
         taskRunner.on('error', errorSpy = sinon.spy());
      },
      tearDown: function() {
         taskRunner = errorSpy = null;
         TaskRunner.scheduleNextOperation = taskRunnerScheduleNextOperation;
      },
      "test Can add functions to a task runner": function() {
         var error = new Error("Some random error"),
             a = sinon.spy(),
             b = sinon.spy(function() {throw error;}),
             c = sinon.spy();

         taskRunner.push(a);
         taskRunner.push(b);
         taskRunner.push(c);
         taskRunner.start();

         Assertions.assert(a.calledOnce).assert(b.calledOnce).assert(c.calledOnce).assert(errorSpy.calledOnce);
         Assertions.assert(errorSpy.calledWith(error));
      }
   }

});

