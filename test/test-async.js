
var TestCase = require('unit-test').TestCase,
    AsyncTest = require('unit-test').AsyncTest,
    Assertions = require('unit-test').Assertions,
    sinon = require('unit-test').Sinon,
    TaskRunner = require('../lib/export').TaskRunner;

var taskRunner, spies, then, now;

module.exports = {
   'setUp': function() { taskRunner = new TaskRunner(); spies = {}; },
   'tearDown': function() { taskRunner = spies = null; },

   'test Asynchronous tasks are all started at the same time as each other': new AsyncTest(function() {
                        Assertions.assert('All tasks initiated before first one is complete', spies.first.calledBefore(spies.firstDone));
                        Assertions.assert('All tasks initiated before first one is complete', spies.second.calledBefore(spies.firstDone));
                        Assertions.assert('All tasks initiated before first one is complete', spies.third.calledBefore(spies.firstDone));
                     },
                     function(setUpComplete) {
                        then = Date.now();
                        taskRunner.push(spies.first = sinon.spy(function(next) { setTimeout(spies.firstDone = sinon.spy(next), 50); }));
                        taskRunner.push(spies.second = sinon.spy(function(next) { setTimeout(spies.secondDone = sinon.spy(next), 50); }));
                        taskRunner.push(spies.third = sinon.spy(function(next) { setTimeout(spies.thirdDone = sinon.spy(next), 50); }));
                        taskRunner.start(spies.done = sinon.spy(setUpComplete));
                     }),

   'test Asynchronous all need to finish before TaskRunner instance is complete': new AsyncTest(function() {
                        Assertions.assert('All tasks initiated before first one is complete', spies.third.calledBefore(spies.firstDone));
                        Assertions.assert('All tasks complete before taskRunner is complete', spies.firstDone.calledBefore(spies.done));
                        Assertions.assert('All tasks complete before taskRunner is complete', spies.secondDone.calledBefore(spies.done));
                        Assertions.assert('All tasks complete before taskRunner is complete', spies.thirdDone.calledBefore(spies.done));
                     },
                     function(setUpComplete) {
                        then = Date.now();
                        taskRunner.push(spies.first = sinon.spy(function(next) { setTimeout(spies.firstDone = sinon.spy(next), 50); }));
                        taskRunner.push(spies.second = sinon.spy(function(next) { setTimeout(spies.secondDone = sinon.spy(next), 50); }));
                        taskRunner.push(spies.third = sinon.spy(function(next) { setTimeout(spies.thirdDone = sinon.spy(next), 50); }));
                        taskRunner.start(spies.done = sinon.spy(setUpComplete));
                     })
};
