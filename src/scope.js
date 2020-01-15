const {isEqual, cloneDeep} = require('lodash');

function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
}

function initWatchVal() {}

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq = false) {
  this.$$watchers.push({
    valueEq,
    watchFn,
    listenerFn: listenerFn || (() => {}),
    last: initWatchVal,
  });
  this.$$lastDirtyWatch = null;
};

Scope.prototype.$digest = function() {
  let TTP = 10;
  let dirty;
  this.$$lastDirtyWatch = null;
  do {
    dirty = this.$$digestOnce();
    TTP--;
    if (!TTP) throw 'To many cycles';
  } while (dirty && TTP);
};

Scope.prototype.$$areEqual = function(newVal, oldVal, valueEq) {
  return valueEq ? isEqual(newVal, oldVal) : newVal === oldVal;
};

Scope.prototype.$$digestOnce = function() {
  let dirty = false;
  for (let i = 0, len = this.$$watchers.length; i < len; i++) {
    const watcher = this.$$watchers[i];
    console.log('watcher:', watcher);
    const newVal = watcher.watchFn(this);
    const oldVal = watcher.last;

    if (this.$$areEqual(newVal, oldVal, watcher.valueEq)) {
      this.$$lastDirtyWatch = watcher;
      watcher.last = watcher.valueEq ? cloneDeep(newVal) : newVal;
      watcher.listenerFn(
        newVal,
        oldVal !== initWatchVal ? oldVal : newVal,
        this,
      );
      dirty = true;
    } else if (this.$$lastDirtyWatch === watcher) {
      return false;
    }
  }
  return dirty;
};
module.exports = Scope;
