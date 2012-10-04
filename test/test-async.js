
var TestCase = require('unit-test').TestCase,
    AsyncTest = require('unit-test').AsyncTest,
    Assertions = require('unit-test').Assertions,
    sinon = require('unit-test').Sinon,
    TaskRunner = require('../lib/taskrunner').TaskRunner;

var taskRunner, spies, then, now;

module.exports = {
   'setUp': function() { taskRunner = new TaskRunner(); spies = {}; },
   'tearDown': function() { taskRunner = spies = null; },
   'test Asynchronous tasks are all started at the same time as each other': new AsyncTest(function() {
                        // called in the right order
                        Assertions.assert(spies.first.calledBefore(spies.second));
                        Assertions.assert(spies.second.calledBefore(spies.third));

                        // called the correct number of times
                        Assertions.assert(spies.first.calledOnce);
                        Assertions.assert(spies.second.calledOnce);
                        Assertions.assert(spies.third.calledOnce);

                        // called very quickly
                        Assertions.assert((Date.now() - then) < 60);
                     },
                     function(next) {
                        then = Date.now();
                        taskRunner.push(spies.first = sinon.spy(function(next) { setTimeout(next, 50); }));
                        taskRunner.push(spies.second = sinon.spy(function(next) { setTimeout(next, 50); }));
                        taskRunner.push(spies.third = sinon.spy(function(next) { setTimeout(next, 50); }));
                        taskRunner.start(next);
                     })
};