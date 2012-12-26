
var TestCase = require('unit-test').TestCase,
    Assertions = require('unit-test').Assertions,
    sinon = require('unit-test').Sinon;

module.exports = new TestCase('Functions', function() {

   var taskRunner, taskRunnerScheduleNextOperation;
   var TaskRunner = require('../lib/taskrunner');

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
      "test Can add functions to a task runner": function() {
         var a = sinon.spy(),
             b = sinon.spy(function(next) {next();}),
             c = sinon.spy();

         taskRunner.push(a, '', false);
         taskRunner.push(b);
         taskRunner.push(c, '', false);
         taskRunner.start();

         Assertions.assert(a.calledOnce).assert(b.calledOnce).assert(c.calledOnce);
         Assertions.assert(a.calledBefore(b)).assert(b.calledBefore(c));
      }
   }

});

