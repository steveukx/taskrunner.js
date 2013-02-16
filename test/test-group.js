
var TestCase = require('unit-test').TestCase,
    AsyncTest = require('unit-test').AsyncTest,
    Assertions = require('unit-test').Assertions,
    sinon = require('unit-test').Sinon,
    TaskRunner = require('../lib/export').TaskRunner;

var taskRunner, spies, now;

module.exports = {
   'setUp': function() { taskRunner = new TaskRunner(); spies = {}; },
   'tearDown': function() {
      taskRunner = spies = null;
   },

   'test Grouped tasks are called in one batch in the runner': new AsyncTest(function() {
          Assertions.assert(spies.firstDone.calledBefore(spies.firstSync));
          Assertions.assert(spies.secondDone.calledBefore(spies.firstSync));
          Assertions.assert(spies.firstSync.calledBefore(spies.done));
       },
       function(setUpComplete) {
          var group = taskRunner.group();

          group.async(spies.firstAsync = sinon.spy(function(next) {
             setTimeout(spies.firstDone = sinon.spy(next), 50);
          }));

          group.async(spies.secondAsync = sinon.spy(function(next) {
             setTimeout(spies.secondDone = sinon.spy(next), 20);
          }));

          taskRunner.sync(spies.firstSync = sinon.spy(function(next) {
             next();
          }));

          taskRunner.start(spies.done = sinon.spy(function() {
             setUpComplete();
          }));
       })
};
