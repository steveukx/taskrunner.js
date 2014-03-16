(function (module, exportsName) {

   var Task = require('./task.js');

   /**
    * The TaskRunner contains multiple tasks and handles the scheduling of running those tasks in series.
    * @constructor
    */
   function TaskRunner() {
      this._results = {};
      this._tasks = [];
      this._id = TaskRunner.id = (TaskRunner.id || 0) + 1;
   }
   TaskRunner.prototype = Object.create(require('events').EventEmitter.prototype);

   /**
    * Schedules the supplied function to be run on the next tick - in the case of Node.js this is on the actual
    * process.nextTick, for browsers this is after a zero ms timeout.
    *
    * @param {Function} fn
    * @function
    */
   TaskRunner.scheduleNextOperation = (function() {
      if(typeof process == 'undefined') {
         return function(fn) {
            setTimeout(fn, 0);
         }
      }
      else {
         return function(fn) {
            process.nextTick(fn);
         }
      }
   }());

   /**
    * Wrapper for the console object to protect against running in browser environment with no console.
    * @type {Object}
    */
   TaskRunner.logger = (function() {
      if(typeof console == 'undefined') {
         return {log: function(msg) {}};
      }
      return console;
   }());

   /**
    * Gets the results for the tasks that were run
    * @returns {Object}
    */
   TaskRunner.prototype.result = function() {
      return this._results;
   };


   /**
    * An optional done handler for when the TaskRunner is complete
    * @type {Function}
    */
   TaskRunner.prototype._onDone = null;

   /**
    * The number of tasks that are still pending
    * @type {Number}
    */
   TaskRunner.prototype._pending = -1;

   /**
    * Pushes a new task into the TaskRunner, supply either a Task instance or the arguments for creating a task - if
    * supplying the arguments for creating a task, the task will default to being asynchronous.
    *
    * @param {Task|Function} task
    * @param {String} [name]
    * @param {Boolean} [asynchronous=true]
    * @return {TaskRunner} this for chaining
    */
   TaskRunner.prototype.push = function(task, name, asynchronous) {
      if (typeof task === "string" && (typeof name === "function" || name instanceof Task)) {
         var args = [].slice.call(arguments, 0);
         task = args[1];
         name = args[0];
      }

      if(task instanceof Task) {
         this._tasks.push(task);
      }
      else if(typeof task === 'function') {
         this._tasks.push(new Task(task, name, asynchronous === undefined ? true : !!asynchronous));
      }
      else {
         throw new Error('Attempting to add a unsupported operation as a task', task);
      }

      this._pending++;
      return this;
   };

   /**
    * Pushes a new task into the TaskRunner to be run synchronously - the supplied or wrapped function does not need to
    * explicitly call the "next" function as it will automatically be called once the task has been called.
    *
    * @param {Task|Function} task
    * @param {String} [name]
    * @return {TaskRunner} this for chaining
    */
   TaskRunner.prototype.sync = function(task, name) {
      return this.push(task, name, false);
   };

   /**
    * Pushes a new task into the TaskRunner to be run asynchronously - the supplied or wrapped function will be called with
    * one argument which is a function that should be called when the task has completed. Any arguments sent to the "next"
    * function will be ignored so, as an example, it can be used as the generic onComplete handler for any file system operation
    *
    * @param {Task|Function} task
    * @param {String} [name]
    * @return {TaskRunner} this for chaining
    */
   TaskRunner.prototype.async = function(task, name) {
      return this.push(task, name, true);
   };


   /**
    * Creates a task group that will be run as though  synchronous task in the current Task Runner (ie: all tasks in the
    * group - including asynchronous ones - will be completed before the next task in the current Task Runner starts).
    *
    * The return value is a new TaskRunner instance that represents the group rather than the outer TaskRunner instance.
    *
    * @param {String} [groupName]
    * @return {TaskRunner}
    */
   TaskRunner.prototype.group = function(groupName) {
      var taskGroup = new TaskRunner();
      this.sync(function(next) {
         taskGroup.start(function() {
            next();
         });
         return false; // wait for the callback before starting the next task
      });
      return taskGroup;
   };

   /**
    * Runs the next pending task
    * @private
    */
   TaskRunner.prototype._process = function() {
      var task = this._tasks.shift();

      if(task) {
         task.run(this._onTaskDone.bind(this, task));
         if(task.async) {
            TaskRunner.scheduleNextOperation(this._process.bind(this));
         }
      }
   };

   /**
    * Handler for any task being completed, in the case of an async task, this is the done handler
    *
    * @param {Task} task
    * @param {Error} [error]   When present the error is an exception that the task generated while running
    * @param {Object} [result] When present, and when the task has a name, the result can will be included as the value
    *                          for this task in the data sent to the completion handler
    */
   TaskRunner.prototype._onTaskDone = function(task, error, result) {
      if(error) {
         this.emit('error', error);
      }

      this._results[task.name] = result;

      if(--this._pending <= 0) {
         this._setDone();
      }
      else if(!task.async) {
         TaskRunner.scheduleNextOperation(this._process.bind(this));
      }
   };

   /**
    * Sets that the processing of tasks is complete
    */
   TaskRunner.prototype._setDone = function() {
      this._onDone && this._onDone(this);
   };

   /**
    * Schedule the next pending task
    * @private
    */
   TaskRunner.prototype._next = function() {
      TaskRunner.scheduleNextOperation(this._process.bind(this));
   };

   /**
    * Schedules the first task to run. If the onDone function parameter is supplied, it will be called when the last
    * step in the TaskRunner has executed.
    *
    * @param {Function} onDone
    * @return {TaskRunner}
    */
   TaskRunner.prototype.start = function(onDone) {
      if(!(this._pending = this._tasks.length)) {
         TaskRunner.scheduleNextOperation(onDone);
      }
      else {
         this._onDone = onDone;
         this._next();
      }
      return this;
   };

   module[exportsName] = TaskRunner;

}.apply(this, typeof module == 'undefined' ? [window, 'Task'] : [module, 'exports']));

