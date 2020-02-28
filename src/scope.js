const { isEqual, cloneDeep, isNaN } = require("lodash");

function Scope() {
  this.$$watchers = [];
  this.$$children = [];
  this.$$lastDirtyWatch = null;
  this.$$asyncQueue = [];
  this.$$applyAsyncQueue = [];
  this.$$phase = null;
}

function initWatchVal() {}

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq = false) {
  this.$$watchers.push({
    valueEq,
    watchFn,
    listenerFn: listenerFn || (() => {}),
    last: initWatchVal
  });
  this.$$lastDirtyWatch = null;
};

Scope.prototype.$digest = function() {
  let ttl = 10;
  let dirty;
  this.$$lastDirtyWatch = null;
  this.$beginPhase("$digest");
  do {
    while (this.$$asyncQueue.length) {
      const asyncTask = this.$$asyncQueue.shift();
      asyncTask.scope.$eval(asyncTask.expression);
    }
    dirty = this.$$digestOnce();
    if ((dirty || this.$$asyncQueue.length) && !ttl--) {
      this.$clearPhase();
      throw "To many cycles";
    }
  } while (dirty || this.$$asyncQueue.length);
  this.$clearPhase();
};

Scope.prototype.$$everyScope = function(fn) {
  if (fn(this)) {
    return this.$$children.every(child => child.$$everyScope(fn));
  } else {
    return false;
  }
}

Scope.prototype.$$areEqual = function(newVal, oldVal, valueEq) {
  return valueEq
    ? isEqual(newVal, oldVal)
    : (isNaN(newVal) && isNaN(oldVal)) || newVal === oldVal;
};

Scope.prototype.$$digestOnce = function() {
  let dirty = false;
  for (let i = 0, len = this.$$watchers.length; i < len; i++) {
    const watcher = this.$$watchers[i];
    const newVal = watcher.watchFn(this);
    const oldVal = watcher.last;

    if (!this.$$areEqual(newVal, oldVal, watcher.valueEq)) {
      this.$$lastDirtyWatch = watcher;
      watcher.last = watcher.valueEq ? cloneDeep(newVal) : newVal;
      watcher.listenerFn(
        newVal,
        oldVal !== initWatchVal ? oldVal : newVal,
        this
      );
      dirty = true;
    } else if (this.$$lastDirtyWatch === watcher) {
      return false;
    }
  }
  return dirty;
};

Scope.prototype.$eval = function(expr, ...args) {
  return expr(this, ...args);
};

Scope.prototype.$apply = function(expr) {
  try {
    this.$beginPhase("$apply");
    return this.$eval(expr);
  } finally {
    this.$clearPhase();
    this.$digest();
  }
  this.$applyPhase();
};

Scope.prototype.$evalAsync = function(expr) {
  if (!this.$$phase && !this.$$asyncQueue.length) {
    setTimeout(() => {
      if (this.$$asyncQueue.length) {
        this.$digest();
      }
    }, 0);
  }
  this.$$asyncQueue.push({ scope: this, expression: expr });
};

Scope.prototype.$beginPhase = function(phase) {
  if (this.$$phase) {
    throw this.$$phase + " already in progress.";
  }
  this.$$phase = phase;
};

Scope.prototype.$clearPhase = function() {
  this.$$phase = null;
};

Scope.prototype.$applyAsync = function(expr) {
  const self = this;
  this.$$applyAsyncQueue.push(() => {
    self.$eval(expr);
  });

  setTimeout(() => {
    self.$apply(() => {
      while (self.$$applyAsyncQueue.length) {
        self.$$applyAsyncQueue.shift()();
      }
    });
  }, 0);
};

Scope.prototype.$new = function() {
  const child = Object.assign(Object.create(this), {
    $$watchers: [],
    $$children: []
  });
  this.$$children.push(child);
  return child;
};

module.exports = Scope;
