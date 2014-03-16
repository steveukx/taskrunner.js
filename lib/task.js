(function (module, exportsName) {

   /**
    * The underlying Task that the TaskRunner will execute.
    *
    * @param {Function} task The function to run when this task is being executed
    * @param {String} name The name of the task
    * @param {Boolean} asynchronous Whether the task will run asynchronously
    * @constructor
    */
   function Task(task, name, asynchronous) {
      if (typeof task != 'function') {
         throw new Error('Task: cannot create a new task with a non-function as the underlying task', task);
      }
      this.id = Task._instanceCount++;
      this.task = task;
      this.name = name || 'task_' + this.id;
      this.async = asynchronous === undefined || asynchronous;
      this.run = this.async ? this.runAsynchronous : this.runSynchronous;
   }

   Task._instanceCount = 0;

   /**
    * The ID of the task
    * @type {Number} */
   Task.prototype.id = 0;

   /**
    * Flag showing whether this task can be run asynchronously
    * @type {Boolean} */
   Task.prototype.async = false;

   /**
    * The function to run when this task is executed
    * @type {Function} */
   Task.prototype.task = null;

   /**
    * The name of this task
    * @type {String} */
   Task.prototype.name = '';

   /**
    * The function that wraps the calling of this task, customised for running (a)synchronously
    * @type {Function} */
   Task.prototype.run = null;

   /**
    * The internal pointer for whether this Task is currently pending a result
    * @type {Boolean}
    * @ignore */
   Task.prototype._running = false;

   /**
    *
    * @return {Boolean}
    */
   Task.prototype.isRunning = function() {
      return this._running;
   };

   /**
    * Execute the task, the supplied argument is the function to call to inform the TaskRunner that the task is complete,
    * this enables the TaskRunner to run asynchronous tasks as well as synchronous ones.
    *
    * @param {Function} callNext
    */
   Task.prototype.runAsynchronous = function (callNext) {
      try {
         this._running = true;
         this.task(this._onEnd.bind(this, callNext));
      }
      catch (e) {
         this._onEnd(callNext, e);
      }
   };

   /**
    * Execute the task, the supplied argument is the function to call to inform the TaskRunner that the task is complete,
    * this enables the TaskRunner to run asynchronous tasks as well as synchronous ones.
    *
    * @param {Function} callNext
    */
   Task.prototype.runSynchronous = function (callNext) {
      try {
         var result = this.task(this._onEnd.bind(this, callNext));
         if(this.task.length !== 1 && result !== false) {
            this._onEnd(callNext);
         }
      }
      catch (e) {
         this._onEnd(callNext, e);
      }
   };

   Task.prototype._onStart = function() {
      this._running = true;
   };

   /**
    * Marks the Task as no longer running
    * @param {Function} [callNext] Optional function to call after this function
    * @param {Error} [error] If the operation caused an exception, this error should be passed back to the runner
    * @param {Object} [result] Optionally adds a data object as the return value for this task
    */
   Task.prototype._onEnd = function(callNext, error, result) {
      this._running = true;
      if(typeof callNext == 'function') {
         callNext(error, result);
      }
   };

   module[exportsName] = Task;

}.apply(this, typeof module == 'undefined' ? [window, 'Task'] : [module, 'exports']));


