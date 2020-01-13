function Scope() {
  this.$$watchers = [];
}

function initWatchVal() {};

Scope.prototype.$watch = function(watchFn, listenerFn) {
  this.$$watchers.push({
    watchFn,
    listenerFn,
    last: initWatchVal,
  });
};
Scope.prototype.$digest = function() {
  this.$$watchers.forEach(watcher => {
    const newVal = watcher.watchFn(this);
    const oldVal = watcher.last;
    watcher.listenerFn(newVal, oldVal, this);
  })
}
module.exports = Scope;
