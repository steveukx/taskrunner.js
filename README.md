taskrunner.js
=============

Simple task runner for JavaScript, either in Node.js or in the browser.

Node.js
=======

Install using npm `npm install task-runner` then use with require:

    var TaskRunner = require('task-runner').TaskRunner,
        Task = require('task-runner').Task;

Browsers
========

Clone the git repo `git clone https://github.com/steveukx/taskrunner.js` and include the `lib/taskrunner.js` file then use with the global variables `TaskRunner` and `Task`.

Usage
=====

Tasks are essentially just functions that are scheduled to run one after each other. To ensure that long running tasks don't block the UI thread in the browser, or hold up the
node.js server for longer than necessary, each task is run on the next available tick.

The functions wrapped as Task instances are called with a single argument which is a function that should be used to tell the TaskRunner that the Task is now complete. This
function can be passed to any long running process (for example accessing the file system, making remote HTTP calls or querying a database).

The TaskRunner's `start` method can accept a function argument to use as a callback for when all tasks have finished running.

Examples
========

Simple usage - create a TaskRunner, set up a task that is asynchronous (making an external call using jQuery's ajax function) the do something else. Both tasks are
functions that use the asynchronous model, and are started by using `taskRunner.start()`.

    var taskRunner = new TaskRunner();

    // make a remote call
    taskRunner.push(function(next) {
      jQuery.ajax( 'someUrl', {
         success: function(data) {
            // use the remote call data
            next();
         }
      }
    });

    // once that call is done with, do other things
    taskRunner.push(function(next) {
      // do something
      next();
    });

    taskRunner.start();

The alternative simple usage pattern is to push Task instances into the TaskRunner:

    function makeRequest(next) {
      jQuery.ajax( 'someUrl', {
         success: function(data) {
            // use the remote call data
            next();
         }
      }
    }

    function afterRequest(next) {
      // do something
      next();
    }

    var taskRunner = new TaskRunner();
    taskRunner.push(new Task(makeRequest));
    taskRunner.push(new Task(afterRequest));
    taskRunner.start();

To run the same process but be informed when the tasks have been completed, pass a callback function to the start method:

    document.body.className = 'loading';
    var taskRunner = new TaskRunner();
    taskRunner.push(new Task(makeRequest));
    taskRunner.push(new Task(afterRequest));
    taskRunner.start(function() {
      document.body.className = '';
    });

Tasks that don't start any asynchronous processes can be created as synchronous tasks, these tasks are still called in the
same way as regular asynchronous tasks, but they don't need to call the `next` method for themselves as this will be done
automatically.

    var synchronousTask = new Task(function() {}, 'name-s', false);
    var asynchronousTask = new Task(function(next) { next(); }, 'name-a', true);

    var taskRunner = new TaskRunner();
    taskRunner.push(synchronousTask);
    taskRunner.push(asynchronousTask);
    taskRunner.start();

Notice that the synchronous task doesn't need to call anything to allow the TaskRunner to continue with other Tasks.

Tasks that use the `next` handler function can supply both error and results back to the TaskRunner, the results are
 then available as `taskRunner.result()` as an object using the name of the task as a key.

    new TaskRunner()
      .async('stepOne', function (next) { next(null, "Returned value" })
      .start(function (taskRunner) {
         var result = taskRunner.result();
         // result.stepOne === "Returned value"
      });
