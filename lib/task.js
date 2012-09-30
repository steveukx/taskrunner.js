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
      this.run = asynchronous === undefined || asynchronous ? this.runAsynchronous : this.runSynchronous;
   }

   Task._instanceCount = 0;

   Task.prototype = {
      /**
       * The ID of the task
       * @type {Number} */
      id:0,

      /**
       * The function to run when this task is executed
       * @type {Function} */
      task:null,

      /**
       * The name of this task
       * @type {String} */
      name:'',

      /**
       * The function that wraps the calling of this task, customised for running (a)synchronously
       * @type {Function} */
      run:null,

      /**
       * The internal pointer for whether this Task is currently pending a result
       * @type {Boolean}
       * @ignore */
      _running:false
   };

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
         this._onEnd();
         TaskRunner.logger.error(e);
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
         if (this.task(this._onEnd.bind(this, callNext)) !== false) {
            this._onEnd(callNext);
         }
      }
      catch (e) {
         this._onEnd();
         console.error(e);
      }
   };

   Task.prototype._onStart = function() {
      this._running = true;
   };

   /**
    * Marks the Task as no longer running
    * @param {Function} [callNext] Optional function to call after this function
    */
   Task.prototype._onEnd = function(callNext) {
      this._running = true;
      if(typeof callNext == 'function') {
         callNext();
      }
   };

   module[exportsName] = Task;

}.apply(this, typeof module == 'undefined' ? [window, 'Task'] : [module, 'exports']))
