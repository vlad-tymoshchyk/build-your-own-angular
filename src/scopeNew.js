const { isEqual } = require("lodash");

function Scope() {
  this.$$watchers = [];
}

function initWatchVal() {}

Scope.prototype.$watch = function(watchFn, listenFn) {
  this.$$watchers.push({
    watchFn,
    listenFn,
    last: initWatchVal
  });
};

Scope.prototype.$digest = function() {
  for (let i = 0, len = this.$$watchers.length; i < len; i++) {
    const watcher = this.$$watchers[i];
    const newVal = watcher.watchFn(this);
    const oldVal = watcher.last;
    if (this.$$areEqual(newVal, oldVal, watcher.valueEq)) {
      listenFn(newVal, oldVal, this);
    }
  }
};

Scope.prototype.$$areEqual = function(newVal, oldVal, valueEq) {
  return valueEq ? isEqual(newVal, oldVal) : newVal === oldVal;
};

Scope.prototype.$digestOnce = function() {};

Scope.prototype.$test = function() {};

module.exports = Scope;
