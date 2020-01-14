function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
}

function initWatchVal() {}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  this.$$watchers.push({
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

Scope.prototype.$$digestOnce = function() {
  let dirty = false;
  let str = '';
  for (let i = 0, len = this.$$watchers.length; i < len; i++) {
    const watcher = this.$$watchers[i];
    const newVal = watcher.watchFn(this);
    const oldVal = watcher.last;

    if (newVal !== oldVal) {
      this.$$lastDirtyWatch = watcher;
      watcher.last = newVal;
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
