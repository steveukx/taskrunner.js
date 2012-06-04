
(function (exports) {

   var emptyFn = function() {};


   /**
    * The underlying Task that the TaskRunner will execute.
    *
    * @param {Function} task The function to run when this task is being executed
    * @param {String} name The name of the task
    * @param {Boolean} asynchronous Whether the task will run asynchronously
    * @constructor
    */
   function Task(task, name, asynchronous) {
      if(typeof task != 'function') {
         throw new Error('Task: cannot create a new task with a non-function as the underlying task', task);
      }
      this.id = Task._instanceCount++;
      this.task = task;
      this.name = name || 'task_' + this.id;
      this.run = asynchronous === undefined || asynchronous ? this.runAsynchronous : this.runSynchronous;
   }

   Task._instanceCount = 0;

   Task.prototype = {
      /**
       * The ID of the task
       * @type {Number} */
      id: 0,

      /**
       * The function to run when this task is executed
       * @type {Function} */
      task: null,

      /**
       * The name of this task
       * @type {String} */
      name: '',

      /**
       * The function that wraps the calling of this task, customised for running (a)synchronously
       * @type {Function} */
      run: null
   };

   /**
    * Execute the task, the supplied argument is the function to call to inform the TaskRunner that the task is complete,
    * this enables the TaskRunner to run asynchronous tasks as well as synchronous ones.
    *
    * @param {Function} callNext
    */
   Task.prototype.runAsynchronous = function(callNext) {
      TaskRunner.logger.log('Running task asynchronously', this.name);
      try {
         this.task(callNext);
      }
      catch (e) {
         TaskRunner.logger.error(e);
      }
   };

   /**
    * Execute the task, the supplied argument is the function to call to inform the TaskRunner that the task is complete,
    * this enables the TaskRunner to run asynchronous tasks as well as synchronous ones.
    *
    * @param {Function} callNext
    */
   Task.prototype.runSynchronous = function(callNext) {
      TaskRunner.logger.log('Running task synchronously', this.name);
      try {
         if(this.task(callNext)!== false) {
            callNext();
         }
      }
      catch (e) {
         TaskRunner.logger.error(e);
      }
   };

   /**
    * The TaskRunner contains multiple tasks and handles the scheduling of running those tasks in series.
    * @constructor
    */
   function TaskRunner() {
      this._tasks = [];
      this._iterations = 0;
   }

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
    * Pushes a new task into the TaskRunner, supply either a Task instance or the arguments for creating a task - if
    * supplying the arguments for creating a task, the task will default to being asynchronous.
    *
    * @param {Task|Function} task
    * @param {String} [name]
    * @param {Boolean} [asynchronous=true]
    * @return {TaskRunner} this for chaining
    */
   TaskRunner.prototype.push = function(task, name, asynchronous) {
      if(task instanceof Task) {
         this._tasks.push(task);
      }
      else if(typeof task === 'function') {
         this._tasks.push(new Task(task, name, asynchronous === undefined ? true : !!asynchronous));
      }
      else {
         throw new Error('Attempting to add a unsupported operation as a task', task);
      }
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
    * Runs the next pending task
    * @private
    */
   TaskRunner.prototype._process = function() {
      var task = this._tasks.shift();

      if(task) {
         task.run(this._next.bind(this));
      }
      else if(this._onDone) {
         this._onDone(this);
      }
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
      this._onDone = onDone;
      this._next();
      return this;
   };

   exports.Task = Task;
   exports.TaskRunner = TaskRunner;

}(typeof module === 'undefined' ? window : module.exports));
