(function (exports) {

   var Task = require('./task.js');

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
