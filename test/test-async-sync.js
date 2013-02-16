
var TestCase = require('unit-test').TestCase,
   Assertions = require('unit-test').Assertions,
   sinon = require('unit-test').Sinon,
   TaskRunner = require('../lib/export').TaskRunner;

var taskRunner, spies, then, now, taskRunnerScheduleNextOperation;

module.exports = new TestCase('Async Sync', {
   setUp: function() {
      taskRunnerScheduleNextOperation = TaskRunner.scheduleNextOperation;
      TaskRunner.scheduleNextOperation = function(fn) { fn() };

      taskRunner = new TaskRunner();
      spies = {};
   },

   tearDown: function() {
      taskRunner = spies = null;
      TaskRunner.scheduleNextOperation = taskRunnerScheduleNextOperation;
   },

   'test Can prevent automatically running the next test by returning false': function() {
      var moveOn;
      taskRunner.sync(function() {
         moveOn = arguments[0];
         return false;
      });
      taskRunner.start(spies.done = sinon.spy(function() {}));

      Assertions.assert(spies.done.callCount === 0, 'Not called the completion handler');
      Assertions.assertEquals(typeof moveOn, 'function', 'Next handler was supplied as a function');

      moveOn();
      Assertions.assert(spies.done.calledOnce, 'Completion should now have been called as the synchronous task has completed');
   },

   'test Can prevent automatically running the next test when explicitly accept a function handler': function() {
      var moveOn;
      taskRunner.sync(function(next) {
         moveOn = next;
      });
      taskRunner.start(spies.done = sinon.spy(function() {}));

      Assertions.assert(spies.done.callCount === 0, 'Not called the completion handler');
      Assertions.assertEquals(typeof moveOn, 'function', 'Next handler was supplied as a function');

      moveOn();
      Assertions.assert(spies.done.calledOnce, 'Completion should now have been called as the synchronous task has completed');
   }
});
